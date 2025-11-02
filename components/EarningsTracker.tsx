import React, { useState, useMemo } from 'react';
import { User, DailyRecord } from '../types';
import { getStrings } from '../constants';
import { calculateSessionEarnings, formatCurrency } from '../utils';
import { EditIcon, ResetIcon } from './Icons';
import AnimatedValue from './AnimatedValue';
import SlideToConfirmModal from './SlideToConfirmModal';

type Strings = ReturnType<typeof getStrings>;

const GoalModal: React.FC<{
    currentGoal: number;
    onClose: () => void;
    onSave: (newGoal: number) => void;
    strings: Strings;
}> = ({ currentGoal, onClose, onSave, strings }) => {
    const [goal, setGoal] = useState(String(currentGoal > 0 ? currentGoal : ''));

    const handleSave = () => {
        const numGoal = parseFloat(goal);
        if (!isNaN(numGoal) && numGoal >= 0) {
            onSave(numGoal);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="modal-content-pane p-6 rounded-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{strings.setGoal}</h3>
                <p className="text-sm text-[var(--secondary-text)] mb-4">{strings.enterEarningsGoal}</p>
                <input
                    type="number"
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    className="w-full p-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-2xl font-bold text-center"
                    placeholder="0"
                    autoFocus
                />
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-3 bg-[var(--bg)] rounded-lg font-semibold transition-colors hover:opacity-80">{strings.cancel}</button>
                    <button onClick={handleSave} className="flex-1 py-3 bg-[var(--accent)] text-white rounded-lg font-semibold">{strings.save}</button>
                </div>
            </div>
        </div>
    );
};

interface EarningsTrackerProps {
    user: User;
    records: DailyRecord[];
    onUpdateUser: (updatedData: Partial<User>) => void;
    strings: Strings;
}

const EarningsTracker: React.FC<EarningsTrackerProps> = ({ user, records, onUpdateUser, strings }) => {
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    
    const { currentEarnings, progress } = useMemo(() => {
        const goal = user.earningsGoal || 0;
        const startTimestamp = user.earningsStart;

        if (!startTimestamp) {
             const total = records.reduce((sum, record) => {
                const dailyTotal = record.sessions.reduce((dailySum, session) => dailySum + calculateSessionEarnings(session), 0);
                return sum + dailyTotal;
            }, 0);
            const progressPercent = goal > 0 ? Math.min((total / goal) * 100, 100) : 0;
            return { currentEarnings: total, progress: progressPercent };
        }

        const startDate = startTimestamp.split('T')[0];
        const relevantRecords = records.filter(r => r.date >= startDate);
        
        const total = relevantRecords.reduce((sum, record) => {
            const dailyTotal = record.sessions.reduce((dailySum, session) => {
                const entriesToCount = session.entries.filter(e => e.timestamp >= startTimestamp);
                const sessionWithFilteredEntries = { ...session, entries: entriesToCount };
                return dailySum + calculateSessionEarnings(sessionWithFilteredEntries);
            }, 0);
            return sum + dailyTotal;
        }, 0);

        const progressPercent = goal > 0 ? Math.min((total / goal) * 100, 100) : 0;
        
        return { currentEarnings: total, progress: progressPercent };
    }, [records, user.earningsGoal, user.earningsStart]);

    const handleConfirmReset = () => {
        onUpdateUser({ earningsStart: new Date().toISOString() });
        setIsResetModalOpen(false);
    };

    const handleSaveGoal = (newGoal: number) => {
        onUpdateUser({ earningsGoal: newGoal });
    };
    
    const size = 120;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - progress / 100);

    return (
        <div className="bg-[var(--surface)] p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-base">{strings.earningsGoal}</h2>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsGoalModalOpen(true)} className="p-2 text-[var(--secondary-text)] hover:text-[var(--accent)]" title={strings.editGoal}>
                        <EditIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsResetModalOpen(true)} className="p-2 text-[var(--secondary-text)] hover:text-red-500" title={strings.resetProgress}>
                        <ResetIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                        <circle
                            className="text-[var(--bg)]"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            r={radius}
                            cx={size/2}
                            cy={size/2}
                        />
                        <circle
                            className="text-[var(--accent)]"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            r={radius}
                            cx={size/2}
                            cy={size/2}
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            transform={`rotate(-90 ${size/2} ${size/2})`}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-extrabold">
                            <AnimatedValue value={Math.floor(progress)} />%
                        </span>
                    </div>
                </div>

                <div className="flex-1">
                    <p className="text-3xl font-extrabold text-[var(--accent)]">
                        <AnimatedValue value={currentEarnings} />
                    </p>
                    <p className="text-sm font-semibold text-[var(--secondary-text)] mt-1">
                        of {formatCurrency(user.earningsGoal || 0)} goal
                    </p>
                </div>
            </div>

            {isGoalModalOpen && <GoalModal currentGoal={user.earningsGoal || 0} onClose={() => setIsGoalModalOpen(false)} onSave={handleSaveGoal} strings={strings} />}
            {isResetModalOpen && (
                <SlideToConfirmModal
                    isOpen={isResetModalOpen}
                    onClose={() => setIsResetModalOpen(false)}
                    onConfirm={handleConfirmReset}
                    title={strings.resetEarningsConfirmationTitle}
                    message={strings.resetEarningsConfirmationBody}
                    strings={strings}
                />
            )}
        </div>
    );
};

export default EarningsTracker;