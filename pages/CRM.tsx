
import React, { useState, useMemo, useCallback } from 'react';
import { Lead } from '../types';
import { MetricCard, Toast } from '../components/ui';
import {
  MagnifyingGlass,
  Plus,
  CheckCircle,
  ChartBar,
  CurrencyDollar,
  Target,
} from '@phosphor-icons/react';
import { useVanguard } from '../context/VanguardContext';
import { calculateStockMetrics, calculateFlowMetrics } from '../utils/metrics';

import { KanbanColumn } from '../components/CRM/KanbanColumn';
import { LeadFormModal } from '../components/CRM/LeadFormModal';
import { SortableLeadCard } from '../components/CRM/SortableLeadCard';
import { LeadCard } from '../components/CRM/LeadCard';

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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export const CRMModule: React.FC = () => {
  const { leads, addLead, updateLead, deleteLead, loading } = useVanguard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Partial<Lead>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  // DnD State
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
        await addLead(leadToSave as unknown as Omit<Lead, 'id' | 'user_id' | 'created_at'>);
        setToast({ msg: 'Novo lead criado!', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (e) {
      setToast({ msg: 'Erro ao salvar lead', type: 'error' });
    }
  }, [editingLead.id, updateLead, addLead]);

  // DnD Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeLeadId = active.id as string;
    const activeLead = leads.find(l => l.id === activeLeadId);
    if (!activeLead) return;

    const overId = over.id as string;
    const isOverColumn = stages.map(s => s.key).includes(overId as any);

    let newStage = activeLead.stage;

    if (isOverColumn) {
      newStage = overId as Lead['stage'];
    } else {
      // Dropped on another Lead?
      const overLead = leads.find(l => l.id === overId);
      if (overLead) {
        newStage = overLead.stage;
      }
    }

    if (activeLead.stage !== newStage) {
      try {
        await updateLead({ ...activeLead, stage: newStage });
        setToast({ msg: `Lead movido para ${newStage}`, type: 'success' });
      } catch (e) {
        setToast({ msg: 'Erro ao mover lead', type: 'error' });
      }
    }
  };


  const stats = useMemo(() => {
    const revenueMetrics = calculateStockMetrics(leads, 'value', l => l.stage === 'fechado');
    const pipelineMetrics = calculateStockMetrics(leads, 'value', l => l.stage !== 'fechado');
    const totalLeads = leads.length;
    const closedLeads = leads.filter(l => l.stage === 'fechado').length;
    const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : '0.0';
    const avgTicketValue = totalLeads > 0 ? (leads.reduce((acc, l) => acc + (Number(l.value) || 0), 0) / totalLeads) : 0;

    return {
      revenueMetrics,
      pipelineMetrics,
      closedLeads,
      conversionRate,
      avgTicketValue
    };
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
        <MetricCard
          title="Receita Confirmada"
          value={stats.revenueMetrics.formatted}
          trend={stats.revenueMetrics.trend}
          trendValue={stats.revenueMetrics.numericTrend}
          subtext={`${stats.closedLeads} contratos fechados`}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Pipeline Total"
          value={stats.pipelineMetrics.formatted}
          trend={stats.pipelineMetrics.trend}
          trendValue={stats.pipelineMetrics.numericTrend}
          subtext="Forecast ponderado"
          icon={ChartBar}
          color="blue"
        />
        <MetricCard
          title="Ticket Médio"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.avgTicketValue)}
          subtext="Calculado via Pipeline"
          icon={CurrencyDollar}
          color="orange"
        />
        <MetricCard
          title="Conversão"
          value={`${stats.conversionRate}%`}
          subtext="Lead p/ Cliente"
          icon={Target}
          color="purple"
        />
      </div>

      <div className="flex-1 overflow-x-auto pb-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-[1200px]">
            {stages.map((stage) => {
              const stageLeads = filteredLeads.filter(l => l.stage === stage.key);
              return (
                <KanbanColumn
                  key={stage.key}
                  id={stage.key}
                  title={stage.label}
                  count={stageLeads.length}
                  color={stage.color}
                >
                  <SortableContext items={stageLeads.map(l => l.id)} strategy={verticalListSortingStrategy}>
                    {stageLeads.map(lead => (
                      <SortableLeadCard key={lead.id} lead={lead}>
                        <LeadCard lead={lead} onClick={handleLeadClick} />
                      </SortableLeadCard>
                    ))}
                  </SortableContext>
                  {stageLeads.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-300 gap-2">
                      <span className="text-xs font-medium">Sem leads</span>
                    </div>
                  )}
                </KanbanColumn>
              );
            })}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="opacity-90 rotate-2 scale-105 cursor-grabbing">
                {(() => {
                  const lead = leads.find(l => l.id === activeId);
                  return lead ? <LeadCard lead={lead} onClick={() => { }} /> : null;
                })()}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
