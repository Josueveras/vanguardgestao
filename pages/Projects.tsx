
import React, { useState, useMemo, useCallback } from 'react';
import { Task } from '../types';
import { 
    Fire, SquaresFour, X, 
    Plus,
    ChartBar, CalendarBlank,
    CheckCircle,
    Stack,
    Eye,
} from '@phosphor-icons/react';
import { Modal, MetricCard } from '../components/ui';
import { useVanguard } from '../context/VanguardContext';

// --- Memoized Sub-components ---

const ProjectTaskCard: React.FC<{ task: Task; onClick: (t: Task) => void }> = React.memo(({ task, onClick }) => {
    const getPriorityColor = (p: string) => {
        switch(p) {
            case 'high': return 'bg-red-100 text-red-700';
            case 'medium': return 'bg-orange-100 text-orange-700';
            case 'low': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div onClick={() => onClick(task)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group hover:border-gray-300 select-none">
            <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{task.tag}</span>
            </div>
            <p className="text-sm font-bold text-vblack leading-snug mb-1">{task.title}</p>
            <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-vblack text-white text-[10px] flex items-center justify-center font-bold">{task.assignee ? task.assignee.charAt(0) : '?'}</div>
                    <span className="text-xs text-gray-500 truncate max-w-[80px]">{task.project}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{task.dueDate}</span>
            </div>
        </div>
    );
}, (prev, next) => prev.task === next.task); // Only re-render if task data changes

const KanbanColumn: React.FC<{ statusLabel: string; count: number; tasks: Task[]; onEdit: (t: Task) => void }> = React.memo(({ statusLabel, count, tasks, onEdit }) => (
    <div className="min-w-[300px] w-full md:w-1/4 bg-gray-50/50 rounded-xl p-3 flex flex-col h-full border border-gray-100/50">
        <h4 className="text-xs font-bold text-gray-500 mb-4 flex justify-between uppercase tracking-wider px-1">
            {statusLabel} <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-600 shadow-sm">{count}</span>
        </h4>
        <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {tasks.map((task) => (
                <ProjectTaskCard key={task.id} task={task} onClick={onEdit} />
            ))}
        </div>
    </div>
));

// --- Main Module ---

export const ProjectsModule = () => {
  const { tasks, clients, addTask, updateTask, deleteTask, projectFilter, setProjectFilter } = useVanguard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task>>({});
  const [viewMode, setViewMode] = useState<'board' | 'gantt' | 'calendar'>('board');
  const [filterClient, setFilterClient] = useState('all');

  const stats = useMemo(() => ({
    activeTasks: tasks.filter(t => t.status === 'todo' || t.status === 'doing').length,
    highPriorityTasks: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
    reviewTasks: tasks.filter(t => t.status === 'review').length,
    completedTasks: tasks.filter(t => t.status === 'done').length
  }), [tasks]);

  const filteredTasks = useMemo(() => tasks.filter(t => {
      const matchesContext = projectFilter === 'high' ? (t.priority === 'high' && t.status !== 'done') : true;
      const matchesClient = filterClient === 'all' || t.project === filterClient;
      return matchesContext && matchesClient;
  }), [tasks, projectFilter, filterClient]);

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingTask({ priority: 'medium', status: 'todo', tag: 'marketing', dueDate: new Date().toISOString().split('T')[0], description: '' });
    setIsModalOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (editingTask.id) {
        updateTask(editingTask as Task);
    } else {
        addTask({ ...editingTask, id: `task-${Date.now()}`, assignee: editingTask.assignee || 'Admin' } as Task);
    }
    setIsModalOpen(false);
  }, [editingTask, updateTask, addTask]);

  const handleDelete = useCallback(() => {
      if (editingTask.id) {
          deleteTask(editingTask.id);
          setIsModalOpen(false);
      }
  }, [editingTask.id, deleteTask]);

  // --- Views ---
  const CalendarView = () => <div className="p-10 text-center text-gray-400">Calendário Otimizado (Placeholder para Demo)</div>; 
  const GanttView = () => <div className="p-10 text-center text-gray-400">Gantt Otimizado (Placeholder para Demo)</div>;

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTask.id ? "Editar Tarefa" : "Nova Tarefa"} size="md">
         <div className="p-6 space-y-4">
             <div><label className="text-xs font-bold text-gray-500 uppercase">Título</label><input className="w-full border p-2 rounded mt-1 text-sm font-semibold" value={editingTask.title || ''} onChange={e => setEditingTask({...editingTask, title: e.target.value})} /></div>
             <div><label className="text-xs font-bold text-gray-500 uppercase">Descrição</label><textarea className="w-full border p-2 rounded mt-1 text-sm h-24 resize-none" value={editingTask.description || ''} onChange={e => setEditingTask({...editingTask, description: e.target.value})} /></div>
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                <select className="w-full border p-2 rounded mt-1 text-sm bg-white" value={editingTask.status} onChange={e => setEditingTask({...editingTask, status: e.target.value as any})}>
                    <option value="todo">A Fazer</option>
                    <option value="doing">Fazendo</option>
                    <option value="review">Revisão</option>
                    <option value="done">Concluído</option>
                </select>
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Prioridade</label>
                <select className="w-full border p-2 rounded mt-1 text-sm bg-white" value={editingTask.priority} onChange={e => setEditingTask({...editingTask, priority: e.target.value as any})}>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                </select>
             </div>
             <div className="flex gap-2 pt-4">
                {editingTask.id && <button onClick={handleDelete} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50">Excluir</button>}
                <button onClick={handleSave} className="flex-1 bg-vblack text-white py-2 rounded-lg text-sm font-bold hover:bg-gray-800">Salvar Tarefa</button>
             </div>
         </div>
      </Modal>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-vblack">Tarefas & Projetos</h2>
                {projectFilter === 'high' && <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-vred rounded text-xs font-bold uppercase tracking-wide"><Fire weight="fill" /> Alta Prioridade <button onClick={() => setProjectFilter('all')} className="ml-1 hover:bg-red-100 p-0.5 rounded-full"><X/></button></span>}
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="flex items-center gap-2">
                 <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-10 px-2 flex items-center">
                     <select className="text-sm bg-transparent outline-none font-medium text-gray-600 cursor-pointer min-w-[150px]" value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
                         <option value="all">Todos os Projetos</option>
                         {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                     </select>
                 </div>
                 <div className="bg-white border border-gray-200 rounded-lg p-1 flex shadow-sm h-10">
                    <button onClick={() => setViewMode('board')} className={`px-3 rounded text-xs font-medium flex items-center gap-1 transition-all ${viewMode === 'board' ? 'bg-gray-100 text-vblack shadow-sm' : 'text-gray-500 hover:text-vblack'}`}><SquaresFour size={18} weight={viewMode === 'board' ? 'fill' : 'regular'} /></button>
                    <button onClick={() => setViewMode('gantt')} className={`px-3 rounded text-xs font-medium flex items-center gap-1 transition-all ${viewMode === 'gantt' ? 'bg-gray-100 text-vblack shadow-sm' : 'text-gray-500 hover:text-vblack'}`}><ChartBar size={18} weight={viewMode === 'gantt' ? 'fill' : 'regular'} /></button>
                    <button onClick={() => setViewMode('calendar')} className={`px-3 rounded text-xs font-medium flex items-center gap-1 transition-all ${viewMode === 'calendar' ? 'bg-gray-100 text-vblack shadow-sm' : 'text-gray-500 hover:text-vblack'}`}><CalendarBlank size={18} weight={viewMode === 'calendar' ? 'fill' : 'regular'} /></button>
                 </div>
              </div>
              <button onClick={handleCreate} className="h-10 px-4 bg-vblack text-white rounded-lg text-sm font-bold hover:bg-gray-800 shadow-lg flex items-center gap-2 whitespace-nowrap"><Plus size={16} weight="bold" /> Nova Tarefa</button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Em Progresso" value={stats.activeTasks} icon={Stack} color="blue" subtext="Tarefas ativas" />
            <MetricCard title="Alta Prioridade" value={stats.highPriorityTasks} icon={Fire} color="red" subtext="Atenção imediata" />
            <MetricCard title="Em Revisão" value={stats.reviewTasks} icon={Eye} color="orange" subtext="Qualidade" />
            <MetricCard title="Concluídas" value={stats.completedTasks} icon={CheckCircle} color="green" subtext="Total entregue" trend="+3" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden mt-2">
        {viewMode === 'board' && (
            <div className="flex gap-6 h-full overflow-x-auto pb-4">
                {['todo', 'doing', 'review', 'done'].map((statusKey) => {
                    const statusLabel = statusKey === 'todo' ? 'A Fazer' : statusKey === 'doing' ? 'Fazendo' : statusKey === 'review' ? 'Revisão' : 'Concluído';
                    const colTasks = filteredTasks.filter(t => t.status === statusKey);
                    return (
                        <KanbanColumn 
                            key={statusKey} 
                            statusLabel={statusLabel} 
                            count={colTasks.length} 
                            tasks={colTasks} 
                            onEdit={handleEdit} 
                        />
                    );
                })}
            </div>
        )}
        {viewMode === 'gantt' && <GanttView />}
        {viewMode === 'calendar' && <CalendarView />}
      </div>
    </div>
  );
};
