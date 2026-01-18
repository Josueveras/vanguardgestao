import React, { useState, useEffect } from 'react';
import { X, Check, Buildings, Clock, Notepad, PaperPlaneRight } from '@phosphor-icons/react';
import { Lead, LeadHistoryItem } from '../../types';

interface LeadFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Partial<Lead>;
    onSave: (lead: Lead) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({ isOpen, onClose, lead, onSave, onDelete }) => {
    if (!isOpen) return null;

    const [activeTab, setActiveTab] = useState<'data' | 'timeline' | 'notes'>('data');
    const [formData, setFormData] = useState<Partial<Lead>>(lead);
    const [newNote, setNewNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(lead);
        setActiveTab('data');
    }, [lead, isOpen]);

    const calculateScore = (data: Partial<Lead>) => {
        let score = 10;
        if (data.budget && data.budget > 10000) score += 30;
        if (data.maturity === 'Alta') score += 40;
        if (data.maturity === 'Média') score += 20;
        if (data.origin === 'Indicação') score += 30;
        if (data.buyingMoment === 'Decisão') score += 20;
        if (data.probability && data.probability > 50) score += 20;
        return Math.min(100, score);
    };

    const handleSave = async () => {
        if (!formData.company || !formData.name) return;
        setIsSaving(true);
        try {
            const finalScore = calculateScore(formData);
            const updatedLead = {
                ...formData,
                leadScore: finalScore,
                timeline: formData.timeline || [],
                lastContact: 'Agora'
            } as Lead;
            if (!lead.id) {
                updatedLead.timeline?.push({
                    id: `t-${Date.now()}`,
                    type: 'creation',
                    date: new Date().toISOString(),
                    author: 'Você',
                    description: 'Lead criado manualmente'
                });
            } else {
                // Log edit if anything changed (simple check)
                const changedFields: string[] = [];
                if (formData.company !== lead.company) changedFields.push('Empresa');
                if (formData.name !== lead.name) changedFields.push('Nome');
                if (formData.value !== lead.value) changedFields.push('Valor');
                if (formData.segment !== lead.segment) changedFields.push('Segmento');
                if (formData.website !== lead.website) changedFields.push('Website');
                if (formData.responsibleName !== lead.responsibleName) changedFields.push('Responsável');
                if (formData.probability !== lead.probability) changedFields.push('Probabilidade');
                if (formData.nextActionDate !== lead.nextActionDate) changedFields.push('Data da Próxima Ação');
                if (formData.nextActionType !== lead.nextActionType) changedFields.push('Tipo da Próxima Ação');

                if (changedFields.length > 0) {
                    updatedLead.timeline?.push({
                        id: `t-${Date.now()}`,
                        type: 'update',
                        date: new Date().toISOString(),
                        author: 'Você',
                        description: `Campos alterados: ${changedFields.join(', ')}`
                    });
                }
            }
            await onSave(updatedLead);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!lead.id || !onDelete) return;
        if (window.confirm('Tem certeza que deseja excluir este lead?')) {
            await onDelete(lead.id);
            onClose();
        }
    };

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        const noteItem: LeadHistoryItem = {
            id: `n-${Date.now()}`,
            type: 'note',
            date: new Date().toISOString(),
            author: 'Você',
            description: newNote
        };
        setFormData(prev => ({
            ...prev,
            timeline: [noteItem, ...(prev.timeline || [])]
        }));
        setNewNote('');
    };

    const SectionTitle = ({ icon: Icon, color, title }: any) => (
        <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0 pb-2 border-b border-gray-100">
            <Icon size={18} className={color} weight="duotone" />
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h4>
        </div>
    );

    const baseInputClass = "w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-black/5 bg-gray-50 focus:bg-white transition-colors";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {formData.id ? formData.company : 'Novo Lead'}
                        {formData.leadScore !== undefined && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 font-normal">Score: {formData.leadScore}</span>
                        )}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><X size={24} /></button>
                </div>

                <div className="flex border-b border-gray-200 px-6 bg-gray-50/50">
                    {[{ id: 'data', icon: Buildings, label: 'Dados' }, { id: 'timeline', icon: Clock, label: 'Timeline' }, { id: 'notes', icon: Notepad, label: 'Notas' }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as 'data' | 'timeline' | 'notes')} className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id ? 'border-vblack text-vblack bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            <tab.icon size={18} weight={activeTab === tab.id ? 'fill' : 'regular'} /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white custom-scrollbar">
                    {activeTab === 'data' && (
                        <div className="space-y-2">
                            <SectionTitle icon={Buildings} color="text-blue-500" title="1. Dados Básicos" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Empresa</label><input className={baseInputClass} value={formData.company || ''} onChange={e => setFormData({ ...formData, company: e.target.value })} autoFocus /></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nome</label><input className={baseInputClass} value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Valor (R$)</label><input type="number" className={baseInputClass} value={formData.value || ''} onChange={e => setFormData({ ...formData, value: Number(e.target.value) })} /></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Segmento</label><input className={baseInputClass} value={formData.segment || ''} onChange={e => setFormData({ ...formData, segment: e.target.value })} /></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Website</label><input className={baseInputClass} value={formData.website || ''} onChange={e => setFormData({ ...formData, website: e.target.value })} /></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Origem</label>
                                    <select className={baseInputClass} value={formData.origin || ''} onChange={e => setFormData({ ...formData, origin: e.target.value })}>
                                        <option value="">Selecione...</option>
                                        <option value="Indicação">Indicação</option>
                                        <option value="Google Ads">Google Ads</option>
                                        <option value="Meta Ads">Meta Ads</option>
                                        <option value="Outbound">Captação Direta</option>
                                    </select>
                                </div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Responsável</label><input className={baseInputClass} value={formData.responsibleName || ''} onChange={e => setFormData({ ...formData, responsibleName: e.target.value })} placeholder="Nome do responsável" /></div>
                                <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Probabilidade (%)</label><input type="number" className={baseInputClass} value={formData.probability || 0} onChange={e => setFormData({ ...formData, probability: Number(e.target.value) })} /></div>
                            </div>

                            <SectionTitle icon={Clock} color="text-orange-500" title="2. Próxima Ação" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tipo de Ação</label>
                                    <select className={baseInputClass} value={formData.nextActionType || 'follow-up'} onChange={e => setFormData({ ...formData, nextActionType: e.target.value as any })}>
                                        <option value="reuniao">Reunião</option>
                                        <option value="ligacao">Ligação</option>
                                        <option value="follow-up">Follow-up</option>
                                        <option value="email">E-mail</option>
                                        <option value="outro">Outro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Data/Hora da Ação</label>
                                    <input type="datetime-local" className={baseInputClass} value={formData.nextActionDate ? formData.nextActionDate.slice(0, 16) : ''} onChange={e => setFormData({ ...formData, nextActionDate: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'timeline' && (
                        <div className="space-y-6">
                            <div className="flex gap-2">
                                <input className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none" placeholder="Nota rápida..." value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddNote()} />
                                <button onClick={handleAddNote} className="bg-vblack text-white p-2 rounded-lg"><PaperPlaneRight size={18} weight="fill" /></button>
                            </div>
                            <div className="relative pl-4 border-l border-gray-200 space-y-4 ml-2">
                                {(formData.timeline || []).map((item) => (
                                    <div key={item.id} className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                            <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'notes' && (
                        <div className="p-4 bg-gray-50 rounded-xl h-full">
                            <p className="text-sm text-gray-400 italic text-center py-10">Módulo de notas em desenvolvimento...</p>
                        </div>
                    )}
                </div>
                <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-between gap-3">
                    {formData.id && onDelete ? (
                        <button onClick={handleDelete} className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1">
                            <X size={16} weight="bold" /> Excluir Lead
                        </button>
                    ) : <div></div>}
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-white border border-transparent hover:border-gray-200 transition-all">Cancelar</button>
                        <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-vblack hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg">
                            {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Check size={18} weight="bold" />}
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
