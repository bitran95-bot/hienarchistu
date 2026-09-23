import { create } from 'zustand';
import { siteContentQuery } from '../../lib/contentQueries';
import type { Project, SiteSettings } from '../types';
import { withTimeout } from '../utils/request';
import { fetchPublicContent } from '../utils/publicContent';

interface AppState {
  projects: Project[];
  settings: SiteSettings | null;
  modalOpen: boolean;
  activeProject: number;
  isDataLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  isDarkMode: boolean;
  
  // Actions
  fetchData: () => Promise<void>;
  setModalOpen: (open: boolean) => void;
  setActiveProject: (index: number) => void;
  toggleDarkMode: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  projects: [],
  settings: null,
  modalOpen: false,
  activeProject: 0,
  isDataLoaded: false,
  isLoading: false,
  error: null,
  isDarkMode: false,

  fetchData: async () => {
    // Tránh fetch lại nếu dữ liệu đã được nạp
    if (get().isDataLoaded || get().isLoading) return;
    set({ isLoading: true, error: null });

    try {
      const data = await withTimeout(signal => fetchPublicContent<{ projects: Project[]; settings: SiteSettings | null }>('site', siteContentQuery, signal));
      
      set({ 
        projects: data.projects || [], 
        settings: data.settings || null,
        isDataLoaded: true,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu';
      console.error("Error fetching data:", error);
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  setModalOpen: (open) => set({ modalOpen: open }),
  setActiveProject: (index) => set({ activeProject: index }),
  toggleDarkMode: () => set((state) => {
    const next = !state.isDarkMode;
    document.body.classList.toggle('dark-mode', next);
    return { isDarkMode: next };
  }),
}));
