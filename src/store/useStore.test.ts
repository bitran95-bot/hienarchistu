import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStore } from './useStore';

// Mock sanity client
vi.mock('../sanityClient', () => {
  return {
    client: {
      fetch: vi.fn().mockResolvedValue({
        projects: [{ _id: '1', name: 'Project 1' }],
        settings: { title: 'Test Settings' }
      })
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
      error: null,
      isDarkMode: false,
    });
    vi.clearAllMocks();
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
