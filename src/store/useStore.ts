import { create } from 'zustand';
import { client } from '../sanityClient';

interface AppState {
  projects: any[];
  settings: any;
  modalOpen: boolean;
  activeProject: number;
  isDataLoaded: boolean;
  
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

  fetchData: async () => {
    // Tránh fetch lại nếu dữ liệu đã được nạp
    if (get().isDataLoaded) return;

    try {
      const data = await client.fetch(`{
        "projects": *[_type == "project"] | order(order asc) {
          ...,
          "modelFileUrl": modelFile.asset->url
        },
        "settings": *[_type == "siteSettings"][0]
      }`);
      
      set({ 
        projects: data.projects || [], 
        settings: data.settings || null,
        isDataLoaded: true 
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },

  setModalOpen: (open) => set({ modalOpen: open }),
  setActiveProject: (index) => set({ activeProject: index }),
}));
