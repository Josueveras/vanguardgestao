
import React, { useState } from 'react';
import { SOPItem } from '../types';
import { BookOpen, FloppyDisk, Trash, Clock, Archive } from '@phosphor-icons/react';
import { Button, Card, Modal, Toast } from '../components/ui';
import { useVanguard } from '../context/VanguardContext';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragStartEvent,
    DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableSOPCard } from '../components/SOP/SortableSOPCard';

export const SOPModule = () => {
    const { sops, addSOP, updateSOP, deleteSOP, archiveSOP, restoreSOP, reorderSOP, loading } = useVanguard();
    const [selectedDoc, setSelectedDoc] = useState<Partial<SOPItem> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
    const [showArchived, setShowArchived] = useState(false);
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // DnD State
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const categories = ['Todos', 'Onboarding', 'Vendas', 'Técnico', 'Design', 'Administrativo', 'Geral'];

    // Ensure we are sorting by position if available
    const filteredSops = sops
        .filter(doc => {
            const matchesCategory = selectedCategory === 'Todos' || doc.category === selectedCategory;
            const matchesArchived = showArchived ? true : !doc.archived;
            return matchesCategory && matchesArchived;
        })
        .sort((a, b) => (a.position || 0) - (b.position || 0));

    const handleEdit = (doc: SOPItem) => {
        setSelectedDoc(doc);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedDoc({
            category: 'Geral',
            content: '',
            title: ''
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!selectedDoc?.title) return;
        setIsSaving(true);
        try {
            if (selectedDoc.id) {
                await updateSOP({ ...selectedDoc, lastUpdated: 'Agora' } as SOPItem);
                setToast({ msg: 'Documento atualizado!', type: 'success' });
            } else {
                await addSOP({
                    ...selectedDoc,
                    lastUpdated: 'Agora',
                    title: selectedDoc.title,
                    position: sops.length // Append to end
                } as any);
                setToast({ msg: 'Documento criado!', type: 'success' });
            }
            setIsModalOpen(false);
        } catch (e) {
            setToast({ msg: 'Erro ao salvar documento', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (selectedDoc?.id) {
            setIsSaving(true);
            try {
                await deleteSOP(selectedDoc.id);
                setToast({ msg: 'Documento excluído.', type: 'success' });
                setIsModalOpen(false);
            } catch (e) {
                setToast({ msg: 'Erro ao excluir documento', type: 'error' });
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleArchive = async () => {
        if (selectedDoc?.id) {
            setIsSaving(true);
            try {
                if (selectedDoc.archived) {
                    await restoreSOP(selectedDoc.id);
                    setToast({ msg: 'Documento restaurado!', type: 'success' });
                } else {
                    await archiveSOP(selectedDoc.id);
                    setToast({ msg: 'Documento arquivado!', type: 'success' });
                }
                setIsModalOpen(false);
            } catch (err) {
                console.error('[SOP] Archive/Restore failed:', err);
                setToast({ msg: 'Erro ao arquivar/restaurar', type: 'error' });
            } finally {
                setIsSaving(false);
            }
        }
    };

    // DnD Handlers
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id) return;

        const activeSop = filteredSops.find(s => s.id === active.id);
        const overSop = filteredSops.find(s => s.id === over.id);

        if (activeSop && overSop && activeSop.category === overSop.category) {
            // BUG #5 FIX: Use reorderSOP instead of dual updates
            try {
                await reorderSOP(activeSop.id, overSop.position || 0);
            } catch (err) {
                console.error('[SOP] Reorder failed:', err);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-10 h-10 border-4 border-vred border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium tracking-wide">Carregando SOPs...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedDoc?.title || "Novo Documento"} size="lg">
                <div className="p-6 h-[70vh] flex flex-col">
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
                            <input className="w-full border p-2 rounded mt-1 font-bold text-lg outline-none focus:ring-2 focus:ring-vred/10 transition-all" value={selectedDoc?.title || ''} onChange={e => setSelectedDoc({ ...selectedDoc, title: e.target.value })} placeholder="Título do SOP" />
                        </div>
                        <div className="w-1/3">
                            <label className="text-xs font-bold text-gray-500 uppercase">Categoria</label>
                            <select className="w-full border p-2 rounded mt-1 bg-white outline-none focus:ring-2 focus:ring-vred/10 transition-all" value={selectedDoc?.category || 'Geral'} onChange={e => setSelectedDoc({ ...selectedDoc, category: e.target.value as any })}>
                                {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1">Conteúdo</label>
                        <textarea
                            className="flex-1 w-full border border-gray-200 rounded-lg p-4 resize-none focus:ring-2 focus:ring-vred/10 outline-none leading-relaxed font-mono text-sm"
                            value={selectedDoc?.content || ''}
                            onChange={e => setSelectedDoc({ ...selectedDoc, content: e.target.value })}
                            placeholder="Escreva o processo aqui..."
                        ></textarea>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                        <div className="flex gap-2">
                            {selectedDoc?.id && (
                                <>
                                    <button onClick={handleArchive} disabled={isSaving} className="p-2.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-gray-200" title={selectedDoc.archived ? "Restaurar Documento" : "Arquivar Documento"}>
                                        <Clock size={20} weight="bold" />
                                    </button>
                                    <button onClick={handleDelete} disabled={isSaving} className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200" title="Excluir Documento">
                                        <Trash size={20} weight="bold" />
                                    </button>
                                </>
                            )}
                        </div>

                        <button onClick={handleSave} disabled={isSaving} className="bg-vblack text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg">
                            {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FloppyDisk size={18} />}
                            {isSaving ? 'Salvando...' : 'Salvar Documento'}
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-vblack">Processos & SOP</h2>
                    <p className="text-sm text-gray-500">Base de conhecimento interna da Vanguarda.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={`p-2.5 rounded-lg border border-gray-200 transition-all ${showArchived ? 'bg-gray-100 text-vblack shadow-sm' : 'text-gray-400 hover:text-vblack bg-white'}`}
                        title="Ver Arquivados"
                    >
                        <Archive size={20} weight={showArchived ? 'fill' : 'regular'} />
                    </button>
                    <Button onClick={handleCreate}>+ Novo Documento</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-fit">
                    <h3 className="font-semibold mb-3 text-sm text-gray-400 uppercase tracking-wider">Categorias</h3>
                    <ul className="space-y-1">
                        {categories.map((cat, i) => (
                            <li
                                key={i}
                                onClick={() => setSelectedCategory(cat)}
                                className={`text-sm px-3 py-2.5 rounded-lg cursor-pointer flex items-center gap-2 transition-all ${selectedCategory === cat ? 'bg-vblack text-white shadow-md font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <BookOpen size={16} weight={selectedCategory === cat ? 'fill' : 'regular'} className={selectedCategory === cat ? 'text-white' : 'text-gray-400'} />
                                {cat}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="lg:col-span-3">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={filteredSops.map(d => d.id)} strategy={rectSortingStrategy}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredSops.map(doc => (
                                    <SortableSOPCard key={doc.id} sop={doc}>
                                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-gray-100 group">
                                            <div className="flex items-start gap-4 p-4 h-full" onClick={() => handleEdit(doc)}>
                                                <div className="mt-1 text-vred bg-red-50 p-2.5 rounded-xl group-hover:bg-vred group-hover:text-white transition-colors">
                                                    <BookOpen size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-vblack text-lg group-hover:text-vred transition-colors">{doc.title}</h4>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase tracking-wider">{doc.category}</span>
                                                        <span className="text-[10px] text-gray-400 font-medium italic">Atualizado: {doc.lastUpdated}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-4 line-clamp-3 leading-relaxed border-t border-gray-50 pt-3">{doc.content || 'Sem conteúdo...'}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </SortableSOPCard>
                                ))}
                            </div>
                        </SortableContext>

                        <DragOverlay>
                            {activeId ? (
                                <div className="opacity-90 rotate-2 scale-105 cursor-grabbing w-[300px]">
                                    {/* Simple active card representation */}
                                    {(() => {
                                        const doc = sops.find(s => s.id === activeId);
                                        if (!doc) return null;
                                        return (
                                            <Card className="bg-white hover:shadow-md h-full border-gray-100">
                                                <div className="flex items-start gap-4 p-4">
                                                    <div className="mt-1 text-vred bg-red-50 p-2.5 rounded-xl">
                                                        <BookOpen size={24} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-vblack text-lg">{doc.title}</h4>
                                                    </div>
                                                </div>
                                            </Card>
                                        )
                                    })()}
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>

                    {filteredSops.length === 0 && (
                        <div className="py-16 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center gap-2">
                            <BookOpen size={48} weight="thin" className="opacity-20" />
                            <p className="font-medium">Nenhum documento encontrado nesta categoria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
