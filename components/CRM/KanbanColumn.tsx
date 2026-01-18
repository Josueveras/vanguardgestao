import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface KanbanColumnProps {
    id: string; // Stage key
    title: string;
    count: number;
    color: string;
    children: React.ReactNode;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = React.memo(({ id, title, count, color, children }) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { type: 'Column', status: id }
    });

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col min-w-[320px] w-full lg:w-1/5 h-full bg-gray-50/50 rounded-xl px-2 py-3 border transition-colors ${isOver ? 'bg-gray-100 border-gray-200 ring-2 ring-vblack/5' : 'border-transparent hover:border-gray-100'}`}
        >
            <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`}></div>
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">{title}</h4>
                </div>
                <span className="bg-white border border-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{count}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar pb-10">
                {children}
            </div>
        </div>
    );
});
