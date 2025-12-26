
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Lead, LeadHistoryItem } from '../types';
import { MetricCard, Toast } from '../components/ui';
import {
  MagnifyingGlass,
  Plus,
  CheckCircle,
  ChartBar,
  CurrencyDollar,
  Target,
  User,
  Clock,
  X,
  Buildings,
  Notepad,
  PaperPlaneRight,
  Check
} from '@phosphor-icons/react';
import { useVanguard } from '../context/VanguardContext';

const LeadCard: React.FC<{ lead: Lead; onClick: (l: Lead) => void }> = React.memo(({ lead, onClick }) => {
  const getProgressWidth = (stage: Lead['stage']) => {
    switch (stage) {
      case 'prospect': return '20%';
      case 'qualificacao': return '40%';
      case 'diagnostico': return '60%';
      case 'proposta': return '80%';
      case 'fechado': return '100%';
      default: return '10%';
    }
  };

  return (
    <div onClick={() => onClick(lead)} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative select-none">
      {lead.leadScore !== undefined && (
        <div className={`absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded ${lead.leadScore > 70 ? 'bg-green-100 text-green-700' : lead.leadScore > 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
          {lead.leadScore}
        </div>
      )}

      <div className="flex justify-between items-start mb-0.5 pr-6">
        <h4 className="font-bold text-vblack text-xs truncate leading-tight">{lead.company}</h4>
      </div>
      <div className="font-bold text-vblack text-xs mb-2">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(lead.value)}
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-1.5 text-gray-500">
          <User size={14} weight="fill" className="text-gray-400" />
          <span className="text-xs font-medium text-gray-500 truncate max-w-[100px]">{lead.name}</span>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
          {lead.origin}
        </span>
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Clock size={14} />
          <span className="text-xs font-medium">{lead.lastContact}</span>
        </div>

        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full"
            style={{ width: getProgressWidth(lead.stage) }}
          ></div>
        </div>
      </div>
    </div>
  );
}, (prev, next) => prev.lead === next.lead);

const KanbanColumn: React.FC<{ title: string; leads: Lead[]; count: number; color: string; onLeadClick: (l: Lead) => void }> = React.memo(({ title, leads, count, color, onLeadClick }) => (
  <div className="flex flex-col min-w-[280px] w-full lg:w-1/5 h-full bg-gray-50/50 rounded-xl px-2 py-3 border border-transparent hover:border-gray-100 transition-colors">
    <div className="flex justify-between items-center mb-4 px-2">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">{title}</h4>
      </div>
      <span className="bg-white border border-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{count}</span>
    </div>

    <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar pb-10">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} />
      ))}
      {leads.length === 0 && (
        <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-300 gap-2">
          <span className="text-xs font-medium">Sem leads</span>
        </div>
      )}
    </div>
  </div>
));

const LeadFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  lead: Partial<Lead>;
  onSave: (lead: Lead) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}> = ({ isOpen, onClose, lead, onSave, onDelete }) => {
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
        const changedFields = [];
        if (formData.company !== lead.company) changedFields.push('Empresa');
        if (formData.name !== lead.name) changedFields.push('Nome');
        if (formData.value !== lead.value) changedFields.push('Valor');
        if (formData.segment !== lead.segment) changedFields.push('Segmento');
        if (formData.website !== lead.website) changedFields.push('Website');

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
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id ? 'border-vblack text-vblack bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
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
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Origem</label>
                  <select className={baseInputClass} value={formData.origin || ''} onChange={e => setFormData({ ...formData, origin: e.target.value })}>
                    <option value="">Selecione...</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Outbound">Outbound</option>
                  </select>
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

export const CRMModule: React.FC = () => {
  const { leads, addLead, updateLead, deleteLead, loading } = useVanguard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Partial<Lead>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  const stages: { key: Lead['stage']; label: string; color: string }[] = useMemo(() => [
    { key: 'prospect', label: 'Prospect', color: 'bg-gray-400' },
    { key: 'qualificacao', label: 'Qualificação', color: 'bg-blue-400' },
    { key: 'diagnostico', label: 'Diagnóstico', color: 'bg-yellow-400' },
    { key: 'proposta', label: 'Proposta', color: 'bg-orange-500' },
    { key: 'fechado', label: 'Fechado', color: 'bg-green-500' },
  ], []);

  const filteredLeads = useMemo(() => leads.filter(l =>
    l.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.name.toLowerCase().includes(searchTerm.toLowerCase())
  ), [leads, searchTerm]);

  const handleLeadClick = useCallback((lead: Lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingLead({ stage: 'prospect', lastContact: 'Hoje', timeline: [] });
    setIsModalOpen(true);
  }, []);

  const handleSaveLead = useCallback(async (leadToSave: Lead) => {
    try {
      if (editingLead.id) {
        await updateLead(leadToSave);
        setToast({ msg: 'Lead atualizado!', type: 'success' });
      } else {
        await addLead(leadToSave as any);
        setToast({ msg: 'Novo lead criado!', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (e) {
      setToast({ msg: 'Erro ao salvar lead', type: 'error' });
    }
  }, [editingLead.id, updateLead, addLead]);

  const stats = useMemo(() => {
    const totalPipeline = leads.reduce((acc, curr) => acc + curr.value, 0);
    const closedValue = leads.filter(l => l.stage === 'fechado').reduce((acc, curr) => acc + curr.value, 0);
    const totalLeads = leads.length;
    const closedLeads = leads.filter(l => l.stage === 'fechado').length;
    const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : '0.0';
    return { totalPipeline, closedValue, closedLeads, conversionRate };
  }, [leads]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-10 h-10 border-4 border-vred border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Carregando CRM...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-8">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <LeadFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lead={editingLead}
        onSave={handleSaveLead}
        onDelete={deleteLead}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-vblack">Pipeline de Vendas</h2>
          <p className="text-gray-500 text-sm mt-1">Gerencie oportunidades e acompanhe a conversão.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-64">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-vblack" size={16} />
            <input type="text" placeholder="Buscar por empresa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-100 outline-none transition-all shadow-sm" />
          </div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-vblack text-white rounded-lg text-sm font-bold hover:bg-gray-800 shadow-lg whitespace-nowrap transition-all"><Plus size={16} weight="bold" /> Novo Lead</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Receita Confirmada" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.closedValue)} subtext={`${stats.closedLeads} contratos fechados`} icon={CheckCircle} color="green" />
        <MetricCard title="Pipeline Total" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.totalPipeline - stats.closedValue)} subtext="Forecast ponderado" icon={ChartBar} color="blue" />
        {/* Métrica Dinâmica de Ticket Médio */}
        <MetricCard
          title="Ticket Médio"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            leads.length > 0
              ? leads.reduce((acc, lead) => acc + (Number(lead.value) || 0), 0) / leads.length
              : 0
          )}
          subtext="Calculado via Pipeline"
          icon={CurrencyDollar}
          color="orange"
        />
        <MetricCard title="Conversão" value={`${stats.conversionRate}%`} subtext="Lead p/ Cliente" icon={Target} color="purple" />
      </div>

      <div className="flex-1 overflow-x-auto pb-2">
        <div className="flex gap-4 h-full min-w-[1200px]">
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage.key);
            return <KanbanColumn key={stage.key} title={stage.label} leads={stageLeads} count={stageLeads.length} color={stage.color} onLeadClick={handleLeadClick} />;
          })}
        </div>
      </div>
    </div>
  );
};
