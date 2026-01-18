import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableColumnProps {
    id: string; // The statusKey (e.g., 'a_fazer')
    children: React.ReactNode;
    className?: string;
}

export const DroppableColumn = ({ id, children, className }: DroppableColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { type: 'Column', status: id }
    });

    return (
        <div ref={setNodeRef} className={`${className} ${isOver ? 'bg-gray-100 ring-2 ring-vblack/10' : ''}`}>
            {children}
        </div>
    );
};
