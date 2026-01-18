import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SOPItem } from '../../types';

interface SortableSOPCardProps {
    sop: SOPItem;
    children: React.ReactNode;
}

export const SortableSOPCard = ({ sop, children }: SortableSOPCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: sop.id, data: { type: 'SOP', sop } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 20 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none h-full">
            {children}
        </div>
    );
};
