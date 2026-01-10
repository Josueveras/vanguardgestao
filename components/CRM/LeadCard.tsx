import React from 'react';
import { User, Clock } from '@phosphor-icons/react';
import { Lead } from '../../types';

interface LeadCardProps {
    lead: Lead;
    onClick: (l: Lead) => void;
    onDragStart: (e: React.DragEvent, lead: Lead) => void;
}

export const LeadCard: React.FC<LeadCardProps> = React.memo(({ lead, onClick, onDragStart }) => {
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
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead)}
            onClick={() => onClick(lead)}
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative select-none"
        >
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
