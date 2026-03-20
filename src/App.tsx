import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { GanttTab } from './components/tabs/GanttTab';
import { FinanceTab } from './components/tabs/FinanceTab';
import { ChartsTab } from './components/tabs/ChartsTab';
import { TaskModal } from './components/modals/TaskModal';
import { ProjectModal } from './components/modals/ProjectModal';
import { CategoryModal } from './components/modals/CategoryModal';
import { ProjectManagerModal } from './components/modals/ProjectManagerModal';
import { useAppStore } from './store/useAppStore';

function App() {
  const [activeTab, setActiveTab] = useState<'gantt' | 'finance' | 'charts'>('gantt');
  const { 
    isProjectModalOpen, setProjectModalOpen, 
    isCategoryModalOpen, setCategoryModalOpen,
    isProjectManagerModalOpen, setProjectManagerModalOpen,
    editingTaskId, setEditingTask 
  } = useAppStore();
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new-task') {
      setEditingTask(-1);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [setEditingTask]);

  return (
    <>
      <Header />
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'gantt' && <GanttTab />}
      {activeTab === 'finance' && <FinanceTab />}
      {activeTab === 'charts' && <ChartsTab />}
      
      <TaskModal 
        isOpen={editingTaskId !== null} 
        onClose={() => setEditingTask(null)} 
        taskId={editingTaskId === -1 ? null : editingTaskId} 
      />
      <ProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setProjectModalOpen(false)} 
      />
      <CategoryModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setCategoryModalOpen(false)} 
      />
      <ProjectManagerModal
        isOpen={isProjectManagerModalOpen}
        onClose={() => setProjectManagerModalOpen(false)}
      />
    </>
  );
}

export default App;
