import { create } from 'zustand';
import { client } from '../sanityClient';
import type { Project, SiteSettings } from '../types';

interface AppState {
  projects: Project[];
  settings: SiteSettings | null;
  modalOpen: boolean;
  activeProject: number;
  isDataLoaded: boolean;
  error: string | null;
  
  // Actions
  fetchData: () => Promise<void>;
  setModalOpen: (open: boolean) => void;
  setActiveProject: (index: number) => void;
}

export const useStore = create<AppState>((set, get) => ({
  projects: [],
  settings: null,
  modalOpen: false,
  activeProject: 0,
  isDataLoaded: false,
  error: null,

  fetchData: async () => {
    // Tránh fetch lại nếu dữ liệu đã được nạp
    if (get().isDataLoaded) return;

    try {
      const data = await client.fetch<{ projects: Project[]; settings: SiteSettings | null }>(`{
        "projects": *[_type == "project"] | order(order asc) {
          ...,
          "modelFileUrl": modelFile.asset->url,
          "pdfFileUrl": pdfFile.asset->url
        },
        "settings": *[_type == "siteSettings"][0]
      }`);
      
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
    }
  },

  setModalOpen: (open) => set({ modalOpen: open }),
  setActiveProject: (index) => set({ activeProject: index }),
}));
