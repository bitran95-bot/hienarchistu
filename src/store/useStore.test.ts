import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useStore } from './useStore';
import { client } from '../sanityClient';
const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn<(...args: unknown[]) => Promise<unknown>>() }));

// Mock sanity client
vi.mock('../sanityClient', () => {
  return {
    client: {
      fetch: fetchMock,
    }
  };
});

describe('useStore', () => {
  beforeEach(() => {
    // Reset Zustand state between tests
    useStore.setState({
      projects: [],
      settings: null,
      modalOpen: false,
      activeProject: 0,
      isDataLoaded: false,
      isLoading: false,
      error: null,
      isDarkMode: false,
    });
    vi.clearAllMocks();
    fetchMock.mockReset().mockResolvedValue({
      projects: [{ _id: '1', name: 'Project 1' }], settings: { title: 'Test Settings' },
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

  it('exposes failure and recovers on explicit retry', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Offline'));
    await useStore.getState().fetchData();
    expect(useStore.getState()).toMatchObject({ error: 'Offline', isLoading: false, isDataLoaded: false });
    await useStore.getState().fetchData();
    expect(useStore.getState()).toMatchObject({ error: null, isLoading: false, isDataLoaded: true });
  });

  it('deduplicates concurrent requests while loading', async () => {
    const first = useStore.getState().fetchData();
    const second = useStore.getState().fetchData();
    await Promise.all([first, second]);
    expect(client.fetch).toHaveBeenCalledTimes(1);
  });

  it('times out a stalled request, aborts it, and ignores its late result after retry', async () => {
    vi.useFakeTimers();
    let resolveStalled!: (data: unknown) => void;
    fetchMock.mockImplementationOnce(() => new Promise(resolve => { resolveStalled = resolve; }));
    const stalled = useStore.getState().fetchData();
    await vi.advanceTimersByTimeAsync(12_000);
    await stalled;
    expect(useStore.getState()).toMatchObject({ error: 'Request timed out', isLoading: false });
    const options = fetchMock.mock.calls[0][2] as { signal: AbortSignal };
    expect(options.signal.aborted).toBe(true);
    await useStore.getState().fetchData();
    resolveStalled({ projects: [], settings: null });
    await Promise.resolve();
    expect(useStore.getState().projects).toHaveLength(1);
    expect(useStore.getState().error).toBeNull();
  });

  it('toggles dark mode correctly', () => {
    const { toggleDarkMode } = useStore.getState();
    expect(useStore.getState().isDarkMode).toBe(false);
    
    toggleDarkMode();
    expect(useStore.getState().isDarkMode).toBe(true);
    
    toggleDarkMode();
    expect(useStore.getState().isDarkMode).toBe(false);
  });

  it('sets modal state and active project correctly', () => {
    const { setModalOpen, setActiveProject } = useStore.getState();
    
    setModalOpen(true);
    expect(useStore.getState().modalOpen).toBe(true);
    
    setActiveProject(5);
    expect(useStore.getState().activeProject).toBe(5);
  });

  it('fetches data correctly when isDataLoaded is false', async () => {
    const { fetchData } = useStore.getState();
    
    await fetchData();
    
    const state = useStore.getState();
    expect(state.isDataLoaded).toBe(true);
    expect(state.projects.length).toBe(1);
    expect(state.projects[0].name).toBe('Project 1');
    expect(state.settings?.title).toBe('Test Settings');
    expect(state.error).toBeNull();
  });

  it('does not fetch data again if isDataLoaded is true', async () => {
    useStore.setState({ isDataLoaded: true });
    
    const { fetchData } = useStore.getState();
    await fetchData();
    
    const { client } = await import('../sanityClient');
    expect(client.fetch).not.toHaveBeenCalled();
  });
});
