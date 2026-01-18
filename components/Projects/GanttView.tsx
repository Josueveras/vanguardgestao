import React, { useMemo, useState } from 'react';
import { Task } from '../../types';
import { useVanguard } from '../../context/VanguardContext';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

export const GanttView = () => {
    const { tasks } = useVanguard();
    const [viewDate, setViewDate] = useState(new Date());

    // Timeline Range: 2 weeks (Current week + Next week) or customizable
    const startDate = startOfWeek(viewDate, { weekStartsOn: 1 }); // Monday
    const endDate = endOfWeek(addDays(viewDate, 14), { weekStartsOn: 1 }); // 2 weeks view

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const groupedTasks = useMemo(() => {
        // Filter tasks that are relevant to this view? 
        // For now show all active non-archived tasks
        return tasks.filter(t => !t.archived && t.status !== 'concluido');
    }, [tasks]);

    const getTaskStyle = (task: Task) => {
        // Calculate position and width based on dates
        // If no start_date, assume start = due - 1 day or created_at
        // For visual simplicity, let's assume default 2 days duration if missing start

        const due = task.dueDate ? parseISO(task.dueDate) : new Date();
        const start = task.start_date ? parseISO(task.start_date) : addDays(due, -2);

        // Check overlap with current view
        if (due < startDate || start > endDate) return null;

        const offsetDays = differenceInDays(start, startDate);
        const durationDays = differenceInDays(due, start) + 1;

        return {
            gridColumnStart: Math.max(1, offsetDays + 2), // +2 because col 1 is Task Name
            gridColumnEnd: `span ${Math.max(1, durationDays)}`,
        };
    };

    const handlePrev = () => setViewDate(addDays(viewDate, -7));
    const handleNext = () => setViewDate(addDays(viewDate, 7));

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-700">Cronograma</h3>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrev} className="p-1 hover:bg-gray-100 rounded"><CaretLeft /></button>
                    <span className="text-sm font-medium capitalize">{format(viewDate, 'MMMM yyyy', { locale: ptBR })}</span>
                    <button onClick={handleNext} className="p-1 hover:bg-gray-100 rounded"><CaretRight /></button>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
                <div className="grid" style={{ gridTemplateColumns: `250px repeat(${days.length}, minmax(40px, 1fr))` }}>
                    {/* Header Row */}
                    <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100 p-2 font-bold text-xs text-gray-500 uppercase">Tarefa</div>
                    {days.map(day => (
                        <div key={day.toISOString()} className={`sticky top-0 z-10 bg-gray-50 border-b border-gray-100 p-2 text-center border-l border-gray-100 ${isSameDay(day, new Date()) ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-500'}`}>
                            <div className="text-[10px] uppercase">{format(day, 'EEE', { locale: ptBR })}</div>
                            <div className="text-sm">{format(day, 'd')}</div>
                        </div>
                    ))}

                    {/* Task Rows */}
                    {groupedTasks.map(task => {
                        const style = getTaskStyle(task);
                        if (!style) return null; // Skip if out of view

                        return (
                            <React.Fragment key={task.id}>
                                <div className="p-3 border-b border-gray-50 text-sm font-medium text-vblack truncate border-r border-gray-100 hover:bg-gray-50 transition-colors">
                                    {task.title}
                                </div>
                                {/* Grid Cells Background */}
                                {days.map(day => (
                                    <div key={day.toISOString()} className={`border-b border-r border-gray-50 ${isSameDay(day, new Date()) ? 'bg-blue-50/30' : ''}`}></div>
                                ))}

                                {/* The Task Bar */}
                                {/* We render it in a separate layer or just utilize grid logic? 
                                    Grid logic with row placement is tricky if we iterate cells.
                                    Actually, standard CSS Grid Gantt puts the bar in the same row as background?
                                    Better: A container for the row that has the grid.
                                */}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Refined Implementation: 
                 Mapping rows is better. 
                 Row: [Name] [Grid of cells with Task Bar overlay]
             */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
                {groupedTasks.map(task => {
                    const due = task.dueDate ? parseISO(task.dueDate) : new Date();
                    const start = task.start_date ? parseISO(task.start_date) : addDays(due, -2);

                    // Check visibility
                    if (due < startDate || start > endDate) return null;

                    const offsetDays = differenceInDays(start, startDate);
                    const duration = Math.max(1, differenceInDays(due, start) + 1);

                    const leftPct = (offsetDays / days.length) * 100;
                    const widthPct = (duration / days.length) * 100;

                    return (
                        <div key={task.id} className="flex border-b border-gray-50 hover:bg-gray-50 transition-colors relative group">
                            <div className="w-[250px] min-w-[250px] p-3 text-sm font-medium text-vblack truncate border-r border-gray-100 sticky left-0 bg-white z-10 group-hover:bg-gray-50">
                                {task.title}
                            </div>
                            <div className="flex-1 relative min-w-[800px]"> {/* Fixed width for scroll */}
                                <div className="absolute inset-0 flex">
                                    {days.map(day => (
                                        <div key={day.toISOString()} className={`flex-1 border-r border-gray-50 ${isSameDay(day, new Date()) ? 'bg-blue-50/30' : ''}`}></div>
                                    ))}
                                </div>
                                {/* Task Bar */}
                                <div
                                    className={`absolute top-2 bottom-2 rounded-md shadow-sm opacity-80 hover:opacity-100 cursor-pointer transition-all flex items-center px-2 text-xs text-white font-bold whitespace-nowrap overflow-hidden
                                        ${task.priority === 'alta' ? 'bg-red-500' : task.priority === 'media' ? 'bg-orange-400' : 'bg-blue-500'}
                                    `}
                                    style={{
                                        left: `${Math.max(0, leftPct)}%`,
                                        width: `${widthPct}%`,
                                        marginLeft: offsetDays < 0 ? `-${Math.abs(offsetDays / days.length) * 100}%` : '0px' // handle partial view... simplified: just clip
                                    }}
                                    title={`${task.title} (${format(start, 'dd/MM')} - ${format(due, 'dd/MM')})`}
                                >
                                    {task.title}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
