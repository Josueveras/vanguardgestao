
import React, { useState, useCallback } from 'react';
import { ContentItem } from '../types';
import { Toast } from '../components/ui';
import {
    Plus,
    InstagramLogo,
    LinkedinLogo,
    YoutubeLogo,
    TiktokLogo,
    Article,
    Image,
    CalendarBlank,
    PaintBrush,
    PaperPlaneRight,
    Lightbulb,
    Trash,
    SquaresFour,
    ListDashes,
    MagicWand,
    Heart,
    ChatCircle,
    ShareNetwork,
    DotsThree,
    BookmarkSimple,
    ThumbsUp,
    PencilSimple,
    CheckCircle,
    X,
    Clock,
    Archive
} from '@phosphor-icons/react';
import { useVanguard } from '../context/VanguardContext';

const PlatformBadge = React.memo(({ platform }: { platform: string }) => {
    switch (platform) {
        case 'instagram': return <div className="p-1 rounded bg-pink-50 text-pink-600"><InstagramLogo size={14} weight="fill" /></div>;
        case 'linkedin': return <div className="p-1 rounded bg-blue-50 text-blue-700"><LinkedinLogo size={14} weight="fill" /></div>;
        case 'youtube': return <div className="p-1 rounded bg-red-50 text-red-600"><YoutubeLogo size={14} weight="fill" /></div>;
        case 'tiktok': return <div className="p-1 rounded bg-black text-white"><TiktokLogo size={14} weight="fill" /></div>;
        default: return <div className="p-1 rounded bg-gray-100 text-gray-600"><Article size={14} weight="fill" /></div>;
    }
});

const ContentCard = React.memo(({
    item,
    onClick,
    onDelete,
    onDragStart
}: {
    item: ContentItem;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
    onDragStart: (e: React.DragEvent) => void;
}) => {
    return (
        <div
            draggable
            onDragStart={onDragStart}
            onClick={onClick}
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group flex flex-col gap-3 relative select-none"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <PlatformBadge platform={item.platform} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{item.format}</span>
                </div>
                <button
                    onClick={onDelete}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                    <Trash size={16} />
                </button>
            </div>

            <div className="flex gap-3">
                {item.creativeUrl && (
                    <img src={item.creativeUrl} alt="Thumbnail" className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                )}
                <div>
                    <span className="text-[10px] font-bold text-gray-400 block mb-0.5">{item.client}</span>
                    <h4 className="font-bold text-vblack text-sm leading-snug line-clamp-2">{item.title}</h4>
                </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1 text-gray-400 text-[10px] font-medium bg-gray-50 px-2 py-1 rounded">
                    <CalendarBlank size={12} />
                    {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </div>
                <div className="w-5 h-5 rounded-full bg-vblack text-white flex items-center justify-center text-[10px] font-bold">
                    {item.assignee ? item.assignee.charAt(0) : 'S'}
                </div>
            </div>
        </div>
    );
}, (prev, next) => prev.item === next.item);

const MobilePreview = React.memo(({ item }: { item: Partial<ContentItem> }) => {
    const isStory = item.format === 'stories';
    const isLinkedIn = item.platform === 'linkedin';
    const username = item.client?.toLowerCase().replace(/\s/g, '_') || 'cliente';

    return (
        <div className="flex justify-center items-center bg-gray-100 p-8 rounded-xl h-full select-none">
            <div className="w-[300px] h-[600px] bg-white rounded-[32px] border-8 border-gray-900 shadow-2xl overflow-hidden relative flex flex-col">
                <div className="h-6 w-full flex justify-between items-center px-6 pt-2 z-20 absolute top-0 text-xs font-bold text-black mix-blend-difference">
                    <span>9:41</span>
                    <div className="flex gap-1">
                        <div className="w-4 h-2.5 bg-black rounded-sm"></div>
                    </div>
                </div>

                {isStory ? (
                    <div className="h-full w-full relative bg-gray-900 flex flex-col">
                        {item.creativeUrl ? (
                            <img src={item.creativeUrl} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center text-white p-8 text-center font-bold text-xl">
                                {item.title}
                            </div>
                        )}
                        <div className="absolute top-0 w-full p-4 pt-8 bg-gradient-to-b from-black/50 to-transparent z-10">
                            <div className="flex gap-1 mb-3">
                                <div className="flex-1 h-0.5 bg-white rounded-full"></div>
                                <div className="flex-1 h-0.5 bg-white/50 rounded-full"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                                <span className="text-white text-sm font-semibold">{username}</span>
                                <span className="text-gray-300 text-xs">2h</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full bg-white pt-8 overflow-y-auto no-scrollbar">
                        <div className="px-4 py-2 flex items-center justify-between border-b border-gray-50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                                <div>
                                    <p className="text-xs font-bold text-black">{username}</p>
                                    {isLinkedIn && <p className="text-[10px] text-gray-500">23.456 seguidores</p>}
                                </div>
                            </div>
                            <DotsThree size={24} />
                        </div>

                        {isLinkedIn && item.caption && (
                            <div className="px-4 py-2 text-xs text-gray-800 whitespace-pre-wrap">
                                {item.caption}
                            </div>
                        )}

                        <div className="aspect-square bg-gray-100 relative flex items-center justify-center overflow-hidden">
                            {item.creativeUrl ? (
                                <img src={item.creativeUrl} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <Image size={48} weight="duotone" />
                                    <span className="text-xs mt-2">Sem imagem</span>
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-3">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex gap-3 text-black">
                                    {isLinkedIn ? (
                                        <>
                                            <ThumbsUp size={20} />
                                            <ChatCircle size={20} />
                                            <ShareNetwork size={20} />
                                        </>
                                    ) : (
                                        <>
                                            <Heart size={24} />
                                            <ChatCircle size={24} />
                                            <PaperPlaneRight size={24} />
                                        </>
                                    )}
                                </div>
                                {!isLinkedIn && <BookmarkSimple size={24} />}
                            </div>

                            {!isLinkedIn && (
                                <>
                                    <p className="text-xs font-bold mb-1">1.234 curtidas</p>
                                    <div className="text-xs text-gray-900">
                                        <span className="font-bold mr-1">{username}</span>
                                        <span className="whitespace-pre-wrap">{item.caption || item.title}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase">Há 2 horas</p>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export const MediaModule: React.FC = () => {
    const { content, clients, addContent, updateContent, deleteContent, archiveContent, restoreContent, loading } = useVanguard();
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
    const [selectedClient, setSelectedClient] = useState<string>('all');
    const [showArchived, setShowArchived] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<ContentItem>>({});
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const columns = [
        { id: 'ideia', label: 'Ideia', icon: Lightbulb },
        { id: 'briefing', label: 'Roteiro', icon: PencilSimple },
        { id: 'producao', label: 'Produção', icon: PaintBrush },
        { id: 'revisao', label: 'Aprovação', icon: CheckCircle },
        { id: 'agendado', label: 'Agendado', icon: CalendarBlank },
        { id: 'publicado', label: 'Postado', icon: PaperPlaneRight },
    ];

    const filteredContent = content.filter(c => {
        const matchesClient = selectedClient === 'all' || c.client === selectedClient;
        const matchesArchived = showArchived ? true : !c.archived;
        return matchesClient && matchesArchived;
    });

    const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
        setDraggedItem(id);
        e.dataTransfer.effectAllowed = "move";
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const onDropReal = async (e: React.DragEvent, status: ContentItem['status']) => {
        e.preventDefault();
        if (!draggedItem) return;

        const item = content.find(c => c.id === draggedItem);
        if (item && item.status !== status) {
            try {
                await updateContent({ ...item, status });
                setToast({ msg: `Movido para ${status}`, type: 'success' });
            } catch (err) {
                setToast({ msg: 'Erro ao mover item', type: 'error' });
            }
        }
        setDraggedItem(null);
    };

    const handleCreate = () => {
        setEditingItem({
            status: 'ideia',
            platform: 'instagram',
            format: 'imagem',
            date: new Date().toISOString().split('T')[0],
            caption: ''
        });
        setIsModalOpen(true);
    };

    const handleEdit = useCallback((item: ContentItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIsSaving(true);
        try {
            await deleteContent(id);
            setToast({ msg: 'Post excluído.', type: 'success' });
            setIsModalOpen(false);
        } catch (err) {
            console.error('[Media] Delete failed:', err);
            setToast({ msg: 'Erro ao excluir post', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    }, [deleteContent]);

    const handleArchive = useCallback(async () => {
        if (editingItem.id) {
            setIsSaving(true);
            try {
                if (editingItem.archived) {
                    await restoreContent(editingItem.id);
                    setToast({ msg: 'Post restaurado.', type: 'success' });
                } else {
                    await archiveContent(editingItem.id);
                    setToast({ msg: 'Post arquivado.', type: 'success' });
                }
                setIsModalOpen(false);
            } catch (err) {
                console.error('[Media] Archive/Restore failed:', err);
                setToast({ msg: 'Erro ao arquivar/restaurar', type: 'error' });
            } finally {
                setIsSaving(false);
            }
        }
    }, [editingItem.id, editingItem.archived, archiveContent, restoreContent]);

    const handleSave = async () => {
        if (!editingItem.title || !editingItem.client) return;

        setIsSaving(true);
        try {
            const itemToSave = {
                ...editingItem,
                assignee: editingItem.assignee || 'Social Media'
            } as any;

            if (editingItem.id) {
                await updateContent(itemToSave);
                setToast({ msg: 'Post atualizado!', type: 'success' });
            } else {
                await addContent(itemToSave);
                setToast({ msg: 'Novo post criado!', type: 'success' });
            }
            setIsModalOpen(false);
        } catch (err) {
            setToast({ msg: 'Erro ao salvar post', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const generateCaptionAI = () => {
        setIsGeneratingAi(true);
        setTimeout(() => {
            const mockCaptions = [
                "🚀 Transforme seu negócio com estratégias que funcionam! Clique no link da bio e saiba mais. #Growth #Marketing",
                "Você sabia que 80% dos seus resultados vêm de 20% dos esforços? Foco no que importa! 💡 #Produtividade",
                "Bastidores de hoje! Preparando novidades incríveis para vocês. Fiquem ligados! 👀✨"
            ];
            setEditingItem(prev => ({ ...prev, caption: mockCaptions[Math.floor(Math.random() * mockCaptions.length)] }));
            setIsGeneratingAi(false);
        }, 1500);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-10 h-10 border-4 border-vred border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Carregando Calendário Editorial...</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            {/* --- SPLIT SCREEN MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex overflow-hidden animate-fadeIn">

                        {/* LEFT: FORM */}
                        <div className="w-full lg:w-1/2 flex flex-col border-r border-gray-200">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                <h3 className="text-xl font-bold text-vblack">{editingItem.id ? 'Editar Post' : 'Novo Post'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black transition-colors"><X size={20} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Título do Conteúdo</label>
                                    <input
                                        className="w-full border border-gray-300 p-3 rounded-lg mt-1 font-bold text-lg focus:ring-2 focus:ring-black/10 outline-none"
                                        placeholder="Ex: Lançamento Campanha X"
                                        value={editingItem.title || ''}
                                        onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Cliente</label>
                                        <select
                                            className="w-full border border-gray-300 p-2.5 rounded-lg mt-1 bg-white"
                                            value={editingItem.client || ''}
                                            onChange={e => setEditingItem({ ...editingItem, client: e.target.value })}
                                        >
                                            <option value="">Selecione...</option>
                                            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Data de Publicação</label>
                                        <input
                                            type="date"
                                            className="w-full border border-gray-300 p-2.5 rounded-lg mt-1"
                                            value={editingItem.date || ''}
                                            onChange={e => setEditingItem({ ...editingItem, date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Plataforma</label>
                                        <select
                                            className="w-full border border-gray-300 p-2.5 rounded-lg mt-1 bg-white"
                                            value={editingItem.platform || 'instagram'}
                                            onChange={e => setEditingItem({ ...editingItem, platform: e.target.value as any })}
                                        >
                                            <option value="instagram">Instagram</option>
                                            <option value="linkedin">LinkedIn</option>
                                            <option value="youtube">YouTube</option>
                                            <option value="tiktok">TikTok</option>
                                            <option value="blog">Blog</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Formato</label>
                                        <select
                                            className="w-full border border-gray-300 p-2.5 rounded-lg mt-1 bg-white"
                                            value={editingItem.format || 'image'}
                                            onChange={e => setEditingItem({ ...editingItem, format: e.target.value as any })}
                                        >
                                            <option value="imagem">Post (Imagem)</option>
                                            <option value="video">Reels / Vídeo</option>
                                            <option value="carrossel">Carrossel</option>
                                            <option value="stories">Stories</option>
                                            <option value="artigo">Artigo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                                        <select
                                            className="w-full border border-gray-300 p-2.5 rounded-lg mt-1 bg-white"
                                            value={editingItem.status || 'ideia'}
                                            onChange={e => setEditingItem({ ...editingItem, status: e.target.value as any })}
                                        >
                                            {columns.map(col => <option key={col.id} value={col.id}>{col.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                        <Image size={16} /> Mídia (URL)
                                    </label>
                                    <input
                                        className="w-full border border-gray-300 p-3 rounded-lg mt-1 text-sm"
                                        placeholder="https://..."
                                        value={editingItem.creativeUrl || ''}
                                        onChange={e => setEditingItem({ ...editingItem, creativeUrl: e.target.value })}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Cole um link de imagem para pré-visualizar.</p>
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Legenda (Copy)</label>
                                        <button
                                            onClick={generateCaptionAI}
                                            disabled={!editingItem.title || isGeneratingAi}
                                            className="text-xs font-bold text-purple-600 hover:bg-purple-50 px-2 py-1 rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                                        >
                                            <MagicWand size={14} weight="fill" className={isGeneratingAi ? "animate-spin" : ""} />
                                            {isGeneratingAi ? 'Gerando...' : 'Gerar com IA'}
                                        </button>
                                    </div>
                                    <textarea
                                        className="w-full border border-gray-300 p-3 rounded-lg h-32 resize-none focus:ring-2 focus:ring-black/10 outline-none text-sm leading-relaxed"
                                        placeholder="Escreva a legenda aqui..."
                                        value={editingItem.caption || ''}
                                        onChange={e => setEditingItem({ ...editingItem, caption: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between gap-3">
                                {editingItem.id && (
                                    <div className="flex gap-2">
                                        <button onClick={handleArchive} disabled={isSaving} className="p-2.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-gray-200" title={editingItem.archived ? "Restaurar Post" : "Arquivar Post"}>
                                            <Clock size={20} weight="bold" />
                                        </button>
                                        <button onClick={() => handleDelete(editingItem.id!)} disabled={isSaving} className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200" title="Excluir Post">
                                            <Trash size={20} weight="bold" />
                                        </button>
                                    </div>
                                )}
                                <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-vblack text-white font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2 ml-auto max-w-xs">
                                    {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    {isSaving ? 'Salvando...' : 'Salvar Post'}
                                </button>
                            </div>
                        </div>

                        {/* RIGHT: PREVIEW (Desktop Only) */}
                        <div className="hidden lg:block w-1/2 bg-gray-100 border-l border-gray-200 overflow-hidden relative">
                            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-500 z-10 border border-white">
                                Live Preview
                            </div>
                            <MobilePreview item={editingItem} />
                        </div>
                    </div>
                </div>
            )}

            {/* --- DASHBOARD HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-vblack">Conteúdo & Mídia</h2>
                    <p className="text-gray-500 text-sm mt-1">Calendário editorial e gestão de social media.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Client Filter */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-10 px-2 flex items-center">
                        <select
                            className="text-sm bg-transparent outline-none font-medium text-gray-600 cursor-pointer min-w-[150px]"
                            value={selectedClient}
                            onChange={(e) => setSelectedClient(e.target.value)}
                        >
                            <option value="all">Todos os Clientes</option>
                            {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>

                    {/* View Toggle */}
                    <div className="bg-white border border-gray-200 rounded-lg p-1 flex shadow-sm h-10">
                        <button
                            onClick={() => setViewMode('board')}
                            className={`px-3 rounded text-xs font-medium flex items-center gap-1 transition-all ${viewMode === 'board' ? 'bg-gray-100 text-vblack shadow-sm' : 'text-gray-400 hover:text-vblack'}`}
                        >
                            <SquaresFour size={18} weight={viewMode === 'board' ? 'fill' : 'regular'} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 rounded text-xs font-medium flex items-center gap-1 transition-all ${viewMode === 'list' ? 'bg-gray-100 text-vblack shadow-sm' : 'text-gray-400 hover:text-vblack'}`}
                        >
                            <ListDashes size={18} weight={viewMode === 'list' ? 'fill' : 'regular'} />
                        </button>
                        <button
                            onClick={() => setShowArchived(!showArchived)}
                            className={`px-3 rounded text-xs font-medium flex items-center gap-1 transition-all ${showArchived ? 'bg-gray-100 text-vblack shadow-sm' : 'text-gray-400 hover:text-vblack'}`}
                            title="Ver Arquivados"
                        >
                            <Archive size={18} weight={showArchived ? 'fill' : 'regular'} />
                        </button>
                    </div>

                    <button onClick={handleCreate} className="h-10 px-4 bg-vblack text-white rounded-lg text-sm font-bold hover:bg-gray-800 shadow-lg shadow-gray-900/10 flex items-center gap-2 whitespace-nowrap">
                        <Plus size={16} weight="bold" /> Novo Post
                    </button>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="flex-1 overflow-hidden">

                {/* VIEW: BOARD (Kanban) */}
                {viewMode === 'board' && (
                    <div className="flex gap-4 h-full overflow-x-auto pb-4 custom-scrollbar">
                        {columns.map(col => {
                            const items = filteredContent.filter(c => c.status === col.id);
                            return (
                                <div
                                    key={col.id}
                                    className="min-w-[280px] w-[280px] flex flex-col h-full bg-gray-50/50 rounded-xl p-2 border border-transparent"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => onDropReal(e, col.id as any)}
                                >
                                    <div className="flex items-center justify-between px-2 mb-3 mt-1">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <col.icon size={16} weight="bold" />
                                            <h4 className="text-xs font-bold uppercase tracking-wider">{col.label}</h4>
                                        </div>
                                        <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500">{items.length}</span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar pb-10">
                                        {items.map(item => (
                                            <ContentCard
                                                key={item.id}
                                                item={item}
                                                onClick={() => handleEdit(item)}
                                                onDelete={(e) => handleDelete(item.id, e)}
                                                onDragStart={(e) => handleDragStart(e, item.id)}
                                            />
                                        ))}
                                        {items.length === 0 && (
                                            <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 text-xs font-medium">
                                                Vazio
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* VIEW: LIST (Table) */}
                {viewMode === 'list' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4">Post</th>
                                        <th className="px-6 py-4">Cliente</th>
                                        <th className="px-6 py-4">Plataforma</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Data</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredContent.map(item => (
                                        <tr key={item.id} onClick={() => handleEdit(item)} className="hover:bg-gray-50 cursor-pointer transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {item.creativeUrl ? (
                                                        <img src={item.creativeUrl} className="w-10 h-10 rounded bg-gray-100 object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400"><Image size={20} /></div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-gray-900 line-clamp-1">{item.title}</p>
                                                        <p className="text-xs text-gray-400 capitalize">{item.format}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-700">{item.client}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <PlatformBadge platform={item.platform} />
                                                    <span className="capitalize text-gray-600">{item.platform}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                                                    {columns.find(c => c.id === item.status)?.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                                {new Date(item.date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={(e) => handleDelete(item.id, e)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};