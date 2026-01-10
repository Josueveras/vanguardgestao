import React from 'react';
import { Lead } from '../../types';
import { LeadCard } from './LeadCard';

interface KanbanColumnProps {
    title: string;
    leads: Lead[];
    count: number;
    color: string;
    onLeadClick: (l: Lead) => void;
    onDragStart: (e: React.DragEvent, lead: Lead) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = React.memo(({ title, leads, count, color, onLeadClick, onDragStart, onDragOver, onDrop }) => (
    <div
        className="flex flex-col min-w-[280px] w-full lg:w-1/5 h-full bg-gray-50/50 rounded-xl px-2 py-3 border border-transparent hover:border-gray-100 transition-colors"
        onDragOver={onDragOver}
        onDrop={onDrop}
    >
        <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${color}`}></div>
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">{title}</h4>
            </div>
            <span className="bg-white border border-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{count}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar pb-10">
            {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} onDragStart={onDragStart} />
            ))}
            {leads.length === 0 && (
                <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-300 gap-2">
                    <span className="text-xs font-medium">Sem leads</span>
                </div>
            )}
        </div>
    </div>
));
