import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    GitFork,
    ListChecks,
    PaperPlaneRight,
    PencilSimple,
    Plus,
    Calendar,
    Hash,
    Timer,
    CaretDown,
    Trash
} from '@phosphor-icons/react';
import { Task, Subtask, TaskComment, ChecklistItem } from '../types';

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Partial<Task>) => void;
    initialData?: Task;
    availableProjects: string[];
    availableAssignees: string[];
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
    availableProjects,
    availableAssignees
}) => {
    const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
    const [formData, setFormData] = useState<Partial<Task>>({
        title: '',
        description: '',
        project: availableProjects[0] || '',
        status: 'a_fazer',
        priority: 'media',
        dueDate: new Date().toISOString().split('T')[0],
        subtasks: [],
        checklist: [],
        comments: [],
        assignees: []
    });

    const [newAssignee, setNewAssignee] = useState('');
    const [editingAssignee, setEditingAssignee] = useState<{ old: string, new: string } | null>(null);
    const [newSubtask, setNewSubtask] = useState('');
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [newComment, setNewComment] = useState('');
    const commentsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                title: '',
                description: '',
                project: availableProjects[0] || '',
                status: 'a_fazer',
                priority: 'media',
                dueDate: new Date().toISOString().split('T')[0],
                subtasks: [],
                checklist: [],
                comments: [],
                assignees: []
            });
        }
    }, [initialData, availableProjects]);

    useEffect(() => {
        if (activeTab === 'comments') {
            commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeTab, formData.comments]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        const subtask: Subtask = {
            id: self.crypto.randomUUID(),
            text: newSubtask,
            completed: false
        };
        setFormData({ ...formData, subtasks: [...(formData.subtasks || []), subtask] });
        setNewSubtask('');
    };

    const addChecklistItem = () => {
        if (!newChecklistItem.trim()) return;
        const item: ChecklistItem = {
            id: self.crypto.randomUUID(),
            text: newChecklistItem,
            completed: false
        };
        setFormData({ ...formData, checklist: [...(formData.checklist || []), item] });
        setNewChecklistItem('');
    };

    const addComment = () => {
        if (!newComment.trim()) return;
        const comment: TaskComment = {
            id: self.crypto.randomUUID(),
            author: 'Você', // Hardcoded for demo/simplicity
            text: newComment,
            date: new Date().toISOString()
        };
        setFormData({ ...formData, comments: [...(formData.comments || []), comment] });
        setNewComment('');
    };

    const toggleSubtask = (id: string) => {
        setFormData({
            ...formData,
            subtasks: formData.subtasks?.map(s => s.id === id ? { ...s, completed: !s.completed } : s)
        });
    };

    const toggleChecklist = (id: string) => {
        setFormData({
            ...formData,
            checklist: formData.checklist?.map(i => i.id === id ? { ...i, completed: !i.completed } : i)
        });
    };

    const removeSubtask = (id: string) => {
        setFormData({ ...formData, subtasks: formData.subtasks?.filter(s => s.id !== id) });
    };

    const removeChecklistItem = (id: string) => {
        setFormData({ ...formData, checklist: formData.checklist?.filter(i => i.id !== id) });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex-shrink-0">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-vblack">
                            {initialData ? 'Editar Tarefa' : 'Nova Tarefa'}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`pb-2 text-sm font-semibold transition-all border-b-2 ${activeTab === 'details' ? 'border-vred text-vred' : 'border-transparent text-gray-400 hover:text-gray-600'
                                } `}
                        >
                            Detalhes
                        </button>
                        <button
                            onClick={() => setActiveTab('comments')}
                            className={`pb-2 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'comments' ? 'border-vred text-vred' : 'border-transparent text-gray-400 hover:text-gray-600'
                                } `}
                        >
                            Comentários
                            {formData.comments && formData.comments.length > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'comments' ? 'bg-vred text-white' : 'bg-gray-100 text-gray-400'
                                    } `}>
                                    {formData.comments.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {activeTab === 'details' ? (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            {/* Title & Description */}
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Título da Tarefa"
                                    className="w-full text-3xl font-bold text-vblack placeholder-gray-300 border-none focus:ring-0 p-0"
                                />
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Adicione uma descrição..."
                                    className="w-full min-h-[100px] text-gray-500 placeholder-gray-300 border-none focus:ring-0 p-0 resize-y"
                                />
                            </div>

                            {/* Metadata Bar */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-gray-50">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Projeto</label>
                                    <div className="relative">
                                        <select
                                            value={formData.project}
                                            onChange={e => setFormData({ ...formData, project: e.target.value })}
                                            className="w-full appearance-none bg-transparent text-sm font-medium text-vblack focus:ring-0 border-none p-0 cursor-pointer"
                                        >
                                            {availableProjects.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                                        className="w-full appearance-none bg-transparent text-sm font-medium text-vblack focus:ring-0 border-none p-0 cursor-pointer"
                                    >
                                        <option value="a_fazer">Backlog</option>
                                        <option value="fazendo">Fazendo</option>
                                        <option value="revisao">Revisão</option>
                                        <option value="concluido">Concluído</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Prioridade</label>
                                    <select
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                                        className="w-full appearance-none bg-transparent text-sm font-medium text-vblack focus:ring-0 border-none p-0 cursor-pointer"
                                    >
                                        <option value="baixa">Baixa</option>
                                        <option value="media">Média</option>
                                        <option value="alta">Alta</option>
                                        <option value="urgente">Urgente</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Prazo</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full bg-transparent text-sm font-medium text-vblack focus:ring-0 border-none p-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Responsáveis Dinâmicos */}
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Responsáveis</label>

                                {/* Lista de Selecionados */}
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.assignees?.map(assigneeName => (
                                        <div key={assigneeName} className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-vblack text-white rounded-lg text-xs font-bold shadow-sm animate-in fade-in zoom-in duration-200 group">
                                            {editingAssignee?.old === assigneeName ? (
                                                <input
                                                    className="bg-white/20 text-white border-none rounded px-1 w-20 outline-none"
                                                    value={editingAssignee.new}
                                                    autoFocus
                                                    onChange={(e) => setEditingAssignee({ ...editingAssignee, new: e.target.value })}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            const updated = formData.assignees?.map(a => a === assigneeName ? editingAssignee.new : a);
                                                            setFormData({ ...formData, assignees: updated });
                                                            setEditingAssignee(null);
                                                        }
                                                    }}
                                                    onBlur={() => setEditingAssignee(null)}
                                                />
                                            ) : (
                                                <span>{assigneeName}</span>
                                            )}

                                            <div className="flex items-center gap-0.5 border-l border-white/20 pl-1 ml-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingAssignee({ old: assigneeName, new: assigneeName })}
                                                    className="p-1 hover:bg-white/20 rounded transition-colors"
                                                    title="Editar Nome"
                                                >
                                                    <PencilSimple size={12} weight="bold" />
                                                </button>
                                                <button
                                                    onClick={() => setFormData({ ...formData, assignees: formData.assignees?.filter(a => a !== assigneeName) })}
                                                    className="p-1 hover:bg-red-500/80 rounded transition-colors"
                                                    title="Remover"
                                                >
                                                    <Trash size={12} weight="bold" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Input Unificado com Datalist */}
                                <div className="relative">
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-vblack/5 focus:border-vblack outline-none p-2.5 placeholder:text-gray-400 font-medium"
                                        placeholder="Digite ou selecione o responsável..."
                                        value={newAssignee}
                                        list="assignees-suggestions"
                                        onChange={(e) => setNewAssignee(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && newAssignee.trim()) {
                                                if (!formData.assignees?.includes(newAssignee.trim())) {
                                                    setFormData({ ...formData, assignees: [...(formData.assignees || []), newAssignee.trim()] });
                                                    setNewAssignee('');
                                                }
                                            }
                                        }}
                                    />
                                    <datalist id="assignees-suggestions">
                                        {availableAssignees.filter(u => !formData.assignees?.includes(u)).map(name => (
                                            <option key={name} value={name} />
                                        ))}
                                    </datalist>

                                    <button
                                        onClick={() => {
                                            if (newAssignee.trim() && !formData.assignees?.includes(newAssignee.trim())) {
                                                setFormData({ ...formData, assignees: [...(formData.assignees || []), newAssignee.trim()] });
                                                setNewAssignee('');
                                            }
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gray-200 text-gray-600 rounded hover:bg-vblack hover:text-white transition-colors"
                                        title="Adicionar"
                                    >
                                        <Plus size={14} weight="bold" />
                                    </button>
                                </div>
                            </div>

                            {/* Subtasks & Checklist */}
                            <div className="grid md:grid-cols-2 gap-10">
                                {/* Subtasks */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-vblack">
                                        <GitFork size={18} className="text-vred" weight="bold" />
                                        <h3 className="text-sm font-bold uppercase tracking-tight">Subtarefas</h3>
                                    </div>

                                    <div className="space-y-2">
                                        {formData.subtasks?.map(sub => (
                                            <div key={sub.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={sub.completed}
                                                        onChange={() => toggleSubtask(sub.id)}
                                                        className="w-4 h-4 rounded border-gray-300 text-vred focus:ring-vred cursor-pointer"
                                                    />
                                                    <span className={`text-sm ${sub.completed ? 'line-through text-gray-400' : 'text-gray-700'} `}>
                                                        {sub.text}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => removeSubtask(sub.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-vred transition-all"
                                                >
                                                    <Trash size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="pt-2">
                                            <input
                                                type="text"
                                                placeholder="Adicionar subtarefa..."
                                                value={newSubtask}
                                                onChange={e => setNewSubtask(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addSubtask()}
                                                className="w-full text-sm border-none bg-gray-50 rounded-lg py-2 px-3 focus:ring-1 focus:ring-gray-200 placeholder-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Checklist */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-vblack">
                                        <ListChecks size={18} className="text-vred" weight="bold" />
                                        <h3 className="text-sm font-bold uppercase tracking-tight">Checklist</h3>
                                    </div>

                                    <div className="space-y-2">
                                        {formData.checklist?.map(item => (
                                            <div key={item.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.completed}
                                                        onChange={() => toggleChecklist(item.id)}
                                                        className="w-4 h-4 rounded border-gray-300 text-vred focus:ring-vred cursor-pointer"
                                                    />
                                                    <span className={`text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'} `}>
                                                        {item.text}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => removeChecklistItem(item.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-vred transition-all"
                                                >
                                                    <Trash size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="pt-2">
                                            <input
                                                type="text"
                                                placeholder="Adicionar item..."
                                                value={newChecklistItem}
                                                onChange={e => setNewChecklistItem(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addChecklistItem()}
                                                className="w-full text-sm border-none bg-gray-50 rounded-lg py-2 px-3 focus:ring-1 focus:ring-gray-200 placeholder-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col animate-in fade-in duration-300">
                            <div className="flex-1 space-y-4 pb-4">
                                {formData.comments?.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm italic">
                                        Nenhum comentário ainda.
                                    </div>
                                ) : (
                                    formData.comments?.map(comment => (
                                        <div key={comment.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-vblack">{comment.author}</span>
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(comment.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed">{comment.text}</p>
                                        </div>
                                    ))
                                )}
                                <div ref={commentsEndRef} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
                    {activeTab === 'details' ? (
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-vblack transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-8 py-2.5 bg-vblack text-white text-sm font-bold rounded-lg shadow-lg hover:shadow-vblack/20 hover:-translate-y-0.5 transition-all"
                            >
                                Salvar Tarefa
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Escreva um comentário..."
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addComment()}
                                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-vblack/5 focus:border-vblack outline-none transition-all"
                            />
                            <button
                                onClick={addComment}
                                className="p-2.5 bg-vblack text-white rounded-xl shadow-md hover:bg-vred transition-colors"
                            >
                                <PaperPlaneRight size={20} weight="fill" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
