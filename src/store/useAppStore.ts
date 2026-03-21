import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AllProjects, ProjectData, Task, Category, CustomChart, ProjectSettings } from '../types';

interface AppState {
  allProjects: AllProjects;
  currentId: string;
  
  // Computed state for the current project
  get currentProject(): ProjectData | undefined;
  
  // UI State
  isProjectModalOpen: boolean;
  isCategoryModalOpen: boolean;
  isProjectManagerModalOpen: boolean;
  editingTaskId: number | null; // null = closed, -1 = new, >0 = editing
  showContr: boolean;
  hidePast: boolean;

  // Actions
  setProjectModalOpen: (open: boolean) => void;
  setCategoryModalOpen: (open: boolean) => void;
  setProjectManagerModalOpen: (open: boolean) => void;
  setEditingTask: (id: number | null) => void;
  setShowContr: (show: boolean) => void;
  setHidePast: (hide: boolean) => void;
  switchProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  createProject: (name: string) => string;
  deleteProject: (id: string) => void;
  updateProjectSettings: (id: string, settings: Partial<ProjectSettings>) => void;
  
  // Task Actions
  addTask: (projectId: string, task: Omit<Task, 'n'>) => void;
  updateTask: (projectId: string, taskN: number, updates: Partial<Task>) => void;
  deleteTask: (projectId: string, taskN: number) => void;
  reorderTasks: (projectId: string, fromIndex: number, toIndex: number) => void;
  setAllProjects: (projects: AllProjects) => void;
  
  // Category Actions
  setCategories: (projectId: string, categories: Category[]) => void;
  
  // Chart Actions
  setCustomCharts: (projectId: string, charts: CustomChart[]) => void;
  addCustomChart: (projectId: string, chart: Omit<CustomChart, 'id'>) => void;
  updateCustomChart: (projectId: string, id: string, updates: Partial<CustomChart>) => void;
  deleteCustomChart: (projectId: string, id: string) => void;
}

const DEF_CATS: Category[] = [
  { name: "Підготовчі/земляні", color: "#2e7d32" },
  { name: "Конструктив", color: "#1565a0" },
  { name: "Інженерні мережі", color: "#b84c0a" },
  { name: "Протипожежні", color: "#b71c1c" },
  { name: "Зовнішні/благоустрій", color: "#5a5a5a" },
  { name: "Оздоблення/введення", color: "#8a6200" },
  { name: "Додані роботи", color: "#006494" },
];

const DEF_PROJ: ProjectSettings = { name: "Будівельний об'єкт", sm: 6, sy: 2025, nm: 16 };

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      allProjects: {
        'p_default': {
          proj: { ...DEF_PROJ },
          cats: [...DEF_CATS],
          tasks: [],
          nextN: 1,
          customCharts: []
        }
      } as AllProjects,
      currentId: 'p_default',
      isProjectModalOpen: false,
      isCategoryModalOpen: false,
      isProjectManagerModalOpen: false,
      editingTaskId: null,
      showContr: false,
      hidePast: false,
      
      get currentProject(): ProjectData | undefined {
        return get().allProjects[get().currentId];
      },

      setProjectModalOpen: (open: boolean) => set({ isProjectModalOpen: open }),
      setCategoryModalOpen: (open: boolean) => set({ isCategoryModalOpen: open }),
      setProjectManagerModalOpen: (open: boolean) => set({ isProjectManagerModalOpen: open }),
      setEditingTask: (id: number | null) => set({ editingTaskId: id }),
      setShowContr: (show: boolean) => set({ showContr: show }),
      setHidePast: (hide: boolean) => set({ hidePast: hide }),

      switchProject: (id: string) => set({ currentId: id }),
      
      renameProject: (id: string, name: string) => set((state: AppState) => ({
        allProjects: {
          ...state.allProjects,
          [id]: {
            ...state.allProjects[id],
            proj: { ...state.allProjects[id].proj, name }
          }
        }
      })),
      
      createProject: (name: string) => {
        const id = 'p_' + Date.now();
        set((state: AppState) => ({
          allProjects: {
            ...state.allProjects,
            [id]: {
              proj: { ...DEF_PROJ, name },
              cats: [...DEF_CATS],
              tasks: [],
              nextN: 1,
              customCharts: []
            }
          },
          currentId: id
        }));
        return id;
      },
      
      deleteProject: (id: string) => set((state: AppState) => {
        const newProjects = { ...state.allProjects };
        delete newProjects[id];
        const nextId = state.currentId === id 
          ? Object.keys(newProjects)[0] || '' 
          : state.currentId;
        return { allProjects: newProjects, currentId: nextId };
      }),
      
      updateProjectSettings: (id: string, settings: Partial<ProjectSettings>) => set((state: AppState) => ({
        allProjects: {
          ...state.allProjects,
          [id]: {
            ...state.allProjects[id],
            proj: { ...state.allProjects[id].proj, ...settings }
          }
        }
      })),
      
      addTask: (projectId: string, task: Omit<Task, 'n'>) => set((state: AppState) => {
        const p = state.allProjects[projectId];
        if (!p) {
          console.error("Project not found:", projectId);
          return state;
        }
        const nextN = Number(p.nextN) || (p.tasks && p.tasks.length > 0 ? Math.max(...p.tasks.map(t => t.n)) + 1 : 1);
        const newTask = { ...task, n: nextN };
        console.log("Adding task:", newTask, "to project:", projectId);
        return {
          allProjects: {
            ...state.allProjects,
            [projectId]: {
              ...p,
              tasks: [...(p.tasks || []), newTask],
              nextN: nextN + 1
            }
          }
        };
      }),
      
      updateTask: (projectId: string, taskN: number, updates: Partial<Task>) => set((state: AppState) => {
        const p = state.allProjects[projectId];
        if (!p) return state;
        return {
          allProjects: {
            ...state.allProjects,
            [projectId]: {
              ...p,
              tasks: p.tasks.map(t => t.n === taskN ? { ...t, ...updates } : t)
            }
          }
        };
      }),
      
      deleteTask: (projectId: string, taskN: number) => set((state: AppState) => {
        const p = state.allProjects[projectId];
        if (!p) return state;
        return {
          allProjects: {
            ...state.allProjects,
            [projectId]: {
              ...p,
              tasks: p.tasks.filter(t => t.n !== taskN)
            }
          }
        };
      }),

      reorderTasks: (projectId: string, fromIndex: number, toIndex: number) => set((state: AppState) => {
        const p = state.allProjects[projectId];
        if (!p) return state;
        const nextTasks = [...p.tasks];
        const [removed] = nextTasks.splice(fromIndex, 1);
        nextTasks.splice(toIndex, 0, removed);
        return {
          allProjects: {
            ...state.allProjects,
            [projectId]: { ...p, tasks: nextTasks }
          }
        };
      }),

      setAllProjects: (allProjects: AllProjects) => set({ allProjects }),

      setCategories: (projectId: string, categories: Category[]) => set((state: AppState) => ({
        allProjects: {
          ...state.allProjects,
          [projectId]: {
            ...state.allProjects[projectId],
            cats: categories
          }
        }
      })),

      setCustomCharts: (projectId: string, charts: CustomChart[]) => set((state: AppState) => ({
        allProjects: {
          ...state.allProjects,
          [projectId]: {
            ...state.allProjects[projectId],
            customCharts: charts
          }
        }
      })),

      addCustomChart: (projectId: string, chart: Omit<CustomChart, 'id'>) => set((state: AppState) => {
        const p = state.allProjects[projectId];
        if (!p) return state;
        const newChart = { ...chart, id: 'cc_' + Date.now() };
        return {
          allProjects: {
            ...state.allProjects,
            [projectId]: {
              ...p,
              customCharts: [...(p.customCharts || []), newChart]
            }
          }
        };
      }),

      updateCustomChart: (projectId: string, id: string, updates: Partial<CustomChart>) => set((state: AppState) => {
        const p = state.allProjects[projectId];
        if (!p) return state;
        return {
          allProjects: {
            ...state.allProjects,
            [projectId]: {
              ...p,
              customCharts: (p.customCharts || []).map(c => c.id === id ? { ...c, ...updates } : c)
            }
          }
        };
      }),

      deleteCustomChart: (projectId: string, id: string) => set((state: AppState) => {
        const p = state.allProjects[projectId];
        if (!p) return state;
        return {
          allProjects: {
            ...state.allProjects,
            [projectId]: {
              ...p,
              customCharts: (p.customCharts || []).filter(c => c.id !== id)
            }
          }
        };
      })
    }),
    {
      name: 'gantt-storage',
      version: 1,
      onRehydrateStorage: () => {
        console.log('Hydration starting...');
        return (rehydratedState, error) => {
          if (error) {
            console.error('An error occurred during hydration', error);
          } else {
            console.log('Hydration finished successfully');
            // Ensure we have at least one project
            if (rehydratedState && Object.keys(rehydratedState.allProjects || {}).length === 0) {
              console.log('No projects found after hydration, check legacy...');
            }
          }
        };
      },
      migrate: (persistedState: any, version: number) => {
        console.log('Migrating state from version:', version);
        if (version === 0 || !persistedState || Object.keys(persistedState.allProjects || {}).length === 0) {
          // Migration from legacy localStorage formats
          try {
            const v3 = JSON.parse(localStorage.getItem('gantt_pro_v3') || 'null');
            if (v3 && v3.allProjects && Object.keys(v3.allProjects).length > 0) {
              console.log('Found v3 data, migrating...');
              return v3;
            }
          } catch (e) {}

          try {
            const oldProjs = JSON.parse(localStorage.getItem('ganttProjs') || '{}');
            const oldCur = localStorage.getItem('ganttCur');
            if (Object.keys(oldProjs).length > 0) {
              console.log('Found old data, migrating...');
              return { allProjects: oldProjs, currentId: oldCur || Object.keys(oldProjs)[0] };
            }
          } catch (e) {}
        }
        return persistedState;
      }
    }
  )
);
