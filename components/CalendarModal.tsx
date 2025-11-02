import React, { useState, useMemo, useEffect } from 'react';
import { DailyRecord } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDateSelect: (date: string) => void;
    currentDate: string; // YYYY-MM-DD
    records: DailyRecord[];
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, onDateSelect, currentDate, records }) => {
    const [viewDate, setViewDate] = useState(new Date(`${currentDate}T12:00:00Z`));

    useEffect(() => {
        // Reset view to current date when modal is opened
        if (isOpen) {
            setViewDate(new Date(`${currentDate}T12:00:00Z`));
        }
    }, [isOpen, currentDate]);

    const activeDays = useMemo(() => {
        const activeDates = records
            .filter(r => r.sessions.some(s => s.entries.length > 0))
            .map(r => r.date);
        return new Set(activeDates);
    }, [records]);

    const calendarGrid = useMemo(() => {
        const year = viewDate.getUTCFullYear();
        const month = viewDate.getUTCMonth();
        
        const firstDayOfMonth = new Date(Date.UTC(year, month, 1));
        const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0));
        
        const days = [];
        // Pad start with previous month's days
        const startDayOfWeek = firstDayOfMonth.getUTCDay();
        for (let i = 0; i < startDayOfWeek; i++) {
            const prevMonthDay = new Date(firstDayOfMonth);
            prevMonthDay.setUTCDate(prevMonthDay.getUTCDate() - (startDayOfWeek - i));
            days.push({ date: prevMonthDay, isPadding: true });
        }
        
        // Current month's days
        for (let i = 1; i <= lastDayOfMonth.getUTCDate(); i++) {
            days.push({ date: new Date(Date.UTC(year, month, i)), isPadding: false });
        }

        // Pad end with next month's days
        const endDayOfWeek = lastDayOfMonth.getUTCDay();
        for (let i = 1; i < 7 - endDayOfWeek; i++) {
            const nextMonthDay = new Date(lastDayOfMonth);
            nextMonthDay.setUTCDate(nextMonthDay.getUTCDate() + i);
            days.push({ date: nextMonthDay, isPadding: true });
        }
        
        return days;
    }, [viewDate]);

    const changeMonth = (amount: number) => {
        const newDate = new Date(viewDate);
        newDate.setUTCMonth(newDate.getUTCMonth() + amount);
        setViewDate(newDate);
    };

    const goToToday = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        onDateSelect(todayStr);
    };

    if (!isOpen) return null;

    const todayStr = new Date().toISOString().split('T')[0];
    const monthYear = viewDate.toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric', month: 'long' });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div 
                className="fixed inset-0 bg-black/50 calendar-backdrop"
                style={{ opacity: isOpen ? 1 : 0 }}
                onClick={onClose}
            />
            <div 
                className="p-4 rounded-2xl w-full max-w-xs shadow-xl calendar-modal"
                style={{ 
                    opacity: isOpen ? 1 : 0, 
                    transform: isOpen ? 'scale(1)' : 'scale(0.95)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg">{monthYear}</h2>
                    <div className="flex items-center gap-1">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-[var(--bg)] text-[var(--secondary-text)]">
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-[var(--bg)] text-[var(--secondary-text)]">
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[var(--secondary-text)] mb-2">
                    {weekDays.map(day => <div key={day}>{day.slice(0, 1)}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {calendarGrid.map(({ date, isPadding }, index) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const isSelected = dateStr === currentDate;
                        const isToday = dateStr === todayStr;
                        const hasActivity = activeDays.has(dateStr);

                        let classes = 'calendar-day-cell';
                        if (isPadding) classes += ' text-[var(--tertiary-text)] opacity-50';
                        if (isSelected) classes += ' selected';
                        if (isToday) classes += ' today';
                        
                        return (
                            <button
                                key={index}
                                disabled={isPadding}
                                onClick={() => onDateSelect(dateStr)}
                                className={classes}
                            >
                                {date.getUTCDate()}
                                {hasActivity && <span className="activity-dot" />}
                            </button>
                        );
                    })}
                </div>
                
                <div className="flex gap-2 mt-4">
                    <button onClick={goToToday} className="flex-1 py-2 px-4 rounded-lg bg-[var(--bg)] font-semibold text-sm hover:bg-[var(--accent-subtle)] transition-colors">Today</button>
                    <button onClick={onClose} className="flex-1 py-2 px-4 rounded-lg bg-[var(--bg)] font-semibold text-sm hover:bg-[var(--accent-subtle)] transition-colors">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default CalendarModal;