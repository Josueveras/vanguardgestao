
import React, { useState, useMemo, useCallback } from 'react';
import { Task } from '../types';
import {
    Plus,
    ChartBar, CalendarBlank,
    CheckCircle,
    Stack,
    Eye,
    Clock,
    Play,
    Pause,
    Trash,
    ListChecks,
    Fire,
    SquaresFour,
    X
} from '@phosphor-icons/react';
import { Modal, MetricCard } from '../components/ui';
import { TaskFormModal } from '../components/TaskFormModal';
import { useVanguard } from '../context/VanguardContext';

const ProjectTaskCard: React.FC<{ task: Task; onClick: (t: Task) => void }> = React.memo(({ task, onClick }) => {
    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'alta':
            case 'urgente': return 'bg-red-100 text-red-700';
            case 'media': return 'bg-orange-100 text-orange-700';
            case 'baixa': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getDifficultyColor = (d: string) => {
        switch (d) {
            case 'alta': return 'text-red-700 bg-red-50 border border-red-100';
            case 'media': return 'text-orange-700 bg-orange-50 border border-orange-100';
            case 'baixa': return 'text-green-700 bg-green-50 border border-green-100';
            default: return 'text-gray-700 bg-gray-50';
        }
    };

    return (
        <div onClick={() => onClick(task)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group hover:border-gray-300 select-none">
            <div className="flex justify-between items-start mb-2 gap-2">
                <div className="flex gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getDifficultyColor(task.difficulty || 'media')}`}>{task.difficulty || 'media'}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{task.tag}</span>
            </div>
            <p className="text-sm font-bold text-vblack leading-snug mb-1">{task.title}</p>
            <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                <div className="flex items-center -space-x-1.5 overflow-hidden">
                    {(task.assignees && task.assignees.length > 0) ? (
                        <>
                            {task.assignees.slice(0, 3).map((assignee, idx) => (
                                <div key={idx} className="w-6 h-6 rounded-full bg-vblack text-white text-[10px] flex items-center justify-center font-bold ring-2 ring-white" title={assignee}>
                                    {assignee.charAt(0)}
                                </div>
                            ))}
                            {task.assignees.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-[8px] flex items-center justify-center font-bold ring-2 ring-white">
                                    +{task.assignees.length - 3}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-[10px] flex items-center justify-center font-bold ring-2 ring-white">?</div>
                    )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate max-w-[80px]">
                    <span className="truncate">{task.project}</span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{task.dueDate}</span>
            </div>
        </div>
    );
}, (prev, next) => prev.task === next.task);

const KanbanColumn: React.FC<{ statusLabel: string; count: number; tasks: Task[]; onEdit: (t: Task) => void }> = React.memo(({ statusLabel, count, tasks, onEdit }) => (
    <div className="min-w-[300px] w-full md:w-1/4 bg-gray-50/50 rounded-xl p-3 flex flex-col h-full border border-gray-100/50">
        <h4 className="text-xs font-bold text-gray-500 mb-4 flex justify-between uppercase tracking-wider px-1">
            {statusLabel} <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-600 shadow-sm">{count}</span>
        </h4>
        <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {tasks.map((task) => (
                <ProjectTaskCard key={task.id} task={task} onClick={onEdit} />
            ))}
            {tasks.length === 0 && (
                <div className="h-20 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 text-xs italic">
                    Nenhuma tarefa
                </div>
            )}
        </div>
    </div>
));

export const ProjectsModule = () => {
    const { tasks, clients, addTask, updateTask, deleteTask, projectFilter, setProjectFilter, loading } = useVanguard();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task>>({});
    const [viewMode, setViewMode] = useState<'board' | 'gantt' | 'calendar'>('board');
    const [filterClient, setFilterClient] = useState('all');
    const [isSaving, setIsSaving] = useState(false);

    const SectionTitle = ({ icon: Icon, color, title }: any) => (
        <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0 pb-2 border-b border-gray-100">
            <Icon size={18} className={color} weight="duotone" />
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h4>
        </div>
    );


    // Timer state
    const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
    const [timerStart, setTimerStart] = useState<number | null>(null);
    const [elapsedThisSession, setElapsedThisSession] = useState(0);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleToggleTimer = (taskId: string) => {
        if (activeTimerId === taskId) {
            // Stop timer
            const totalElapsed = elapsedThisSession + Math.floor((Date.now() - (timerStart || 0)) / 1000);
            const taskToUpdate = tasks.find(t => t.id === taskId);
            if (taskToUpdate) {
                updateTask({ ...taskToUpdate, timeSpent: (taskToUpdate.timeSpent || 0) + totalElapsed });
            }
            setActiveTimerId(null);
            setTimerStart(null);
            setElapsedThisSession(0);
        } else {
            // Start timer
            if (activeTimerId) {
                // Stop previous first
                handleToggleTimer(activeTimerId);
            }
            setActiveTimerId(taskId);
            setTimerStart(Date.now());
            setElapsedThisSession(0);
        }
    };


    const stats = useMemo(() => ({
        activeTasks: tasks.filter(t => t.status === 'todo' || t.status === 'doing').length,
        highPriorityTasks: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
        reviewTasks: tasks.filter(t => t.status === 'review').length,
        completedTasks: tasks.filter(t => t.status === 'done').length
    }), [tasks]);

    const processedTasks = useMemo(() => {
        let result = tasks.filter(t => {
            const matchesContext = projectFilter === 'high' ? (t.priority === 'urgente' || t.priority === 'alta') && t.status !== 'concluido' : true;
            const matchesClient = filterClient === 'all' || t.project === filterClient;
            return matchesContext && matchesClient;
        });

        // Apply Smart Sort (ROI: Priority Value + Difficulty Bonus)
        return result.sort((a, b) => {
            // Priority Values: Higher is more urgent
            const pVal: Record<string, number> = { urgente: 4, alta: 3, media: 2, baixa: 1 };
            // Difficulty Values: Easier (lower diff) adds more value/speed bonus
            // Baixa = +3 (Quick Win), Media = +2, Alta = +1 (Slow)
            const dVal: Record<string, number> = { baixa: 3, media: 2, alta: 1 };

            const scoreA = (pVal[a.priority] || 1) + (dVal[a.difficulty || 'media'] || 2);
            const scoreB = (pVal[b.priority] || 1) + (dVal[b.difficulty || 'media'] || 2);

            return scoreB - scoreA; // Descending Order
        });
    }, [tasks, projectFilter, filterClient]);

    const handleEdit = useCallback((task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    }, []);

    const uniqueAssignees = useMemo(() => {
        const all = new Set<string>();
        // Add defaults if desired
        tasks.forEach(t => t.assignees?.forEach(a => all.add(a)));
        return Array.from(all).sort();
    }, [tasks]);

    const handleCreate = useCallback(() => {
        setEditingTask({
            title: '',
            description: '',
            priority: 'media',
            status: 'a_fazer',
            tag: 'marketing',
            dueDate: new Date().toISOString().split('T')[0],
            subtasks: [],
            checklist: [],
            comments: [],
            assignees: []
        });
        setIsModalOpen(true);
    }, []);

    const handleSaveDirect = useCallback(async (task: Partial<Task>) => {
        setIsSaving(true);
        try {
            if (task.id) {
                await updateTask(task as Task);
            } else {
                await addTask({
                    ...task,
                    assignee: task.assignees && task.assignees.length > 0 ? task.assignees[0] : 'Admin'
                } as any);
            }
            setIsModalOpen(false);
        } finally {
            setIsSaving(false);
        }
    }, [updateTask, addTask]);

    const handleDelete = useCallback(async () => {
        if (editingTask.id) {
            setIsSaving(true);
            try {
                await deleteTask(editingTask.id);
                setIsModalOpen(false);
            } finally {
                setIsSaving(false);
            }
        }
    }, [editingTask.id, deleteTask]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-10 h-10 border-4 border-vred border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Carregando Projetos & Tarefas...</p>
            </div>
        );
    }

    const CalendarView = () => <div className="p-10 text-center text-gray-400 font-medium">Módulo de Calendário em desenvolvimento...</div>;
    const GanttView = () => <div className="p-10 text-center text-gray-400 font-medium">Módulo de Gantt em desenvolvimento...</div>;

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            <TaskFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDirect}
                initialData={editingTask.id ? editingTask as Task : undefined}
                availableProjects={clients.map(c => c.name)}
                availableAssignees={uniqueAssignees}
            />

            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-vblack">Tarefas & Projetos</h2>
                        {projectFilter === 'high' && <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-vred rounded text-xs font-bold uppercase tracking-wide animate-pulse"><Fire weight="fill" /> Alta Prioridade <button onClick={() => setProjectFilter('all')} className="ml-1 hover:bg-red-100 p-0.5 rounded-full"><X /></button></span>}
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-10 px-2 flex items-center transition-all hover:border-gray-300">
                                <select className="text-sm bg-transparent outline-none font-bold text-gray-600 cursor-pointer min-w-[150px]" value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
                                    <option value="all">Todos os Projetos</option>
                                    {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-1 flex shadow-sm h-10">
                                <button onClick={() => setViewMode('board')} className={`px-3 rounded text-xs font-medium flex items-center gap-1 transition-all ${viewMode === 'board' ? 'bg-gray-100 text-vblack shadow-sm' : 'text-gray-400 hover:text-vblack'}`}><SquaresFour size={20} weight={viewMode === 'board' ? 'fill' : 'regular'} /></button>
                                <button onClick={() => setViewMode('gantt')} className={`px-3 rounded text-xs font-medium flex items-center gap-1 transition-all ${viewMode === 'gantt' ? 'bg-gray-100 text-vblack shadow-sm' : 'text-gray-400 hover:text-vblack'}`}><ChartBar size={20} weight={viewMode === 'gantt' ? 'fill' : 'regular'} /></button>
                                <button onClick={() => setViewMode('calendar')} className={`px-3 rounded text-xs font-medium flex items-center gap-1 transition-all ${viewMode === 'calendar' ? 'bg-gray-100 text-vblack shadow-sm' : 'text-gray-400 hover:text-vblack'}`}><CalendarBlank size={20} weight={viewMode === 'calendar' ? 'fill' : 'regular'} /></button>
                            </div>
                        </div>
                        <button onClick={handleCreate} className="h-10 px-4 bg-vblack text-white rounded-lg text-sm font-bold hover:bg-gray-800 shadow-lg flex items-center gap-2 whitespace-nowrap transition-all active:scale-95"><Plus size={18} weight="bold" /> Nova Tarefa</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard title="Em Progresso" value={stats.activeTasks} icon={Stack} color="blue" subtext="Tarefas ativas" />
                    <MetricCard title="Alta Prioridade" value={stats.highPriorityTasks} icon={Fire} color="red" subtext="Atenção imediata" />
                    <MetricCard title="Em Revisão" value={stats.reviewTasks} icon={Eye} color="orange" subtext="Qualidade" />
                    <MetricCard title="Concluídas" value={stats.completedTasks} icon={CheckCircle} color="green" subtext="Tarefas concluídas" />
                </div>
            </div>

            <div className="flex-1 overflow-hidden mt-2">
                {viewMode === 'board' && (
                    <div className="flex gap-6 h-full overflow-x-auto pb-4 custom-scrollbar">
                        {['a_fazer', 'fazendo', 'revisao', 'concluido'].map((statusKey) => {
                            const statusLabel = statusKey === 'a_fazer' ? 'A Fazer' : statusKey === 'fazendo' ? 'Fazendo' : statusKey === 'revisao' ? 'Revisão' : 'Concluído';
                            const colTasks = processedTasks.filter(t => t.status === statusKey);
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
