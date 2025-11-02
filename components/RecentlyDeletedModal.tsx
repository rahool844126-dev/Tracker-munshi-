import React, { useState, useMemo, useEffect } from 'react';
import { DailyRecord, SessionToDelete, ClothSession } from '../types';
import { getStrings } from '../constants';
import { TrashIcon } from './Icons';
import AdvancedDeleteModal from './AdvancedDeleteModal';

type Strings = ReturnType<typeof getStrings>;

interface RecentlyDeletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: DailyRecord[];
  onRestoreSessions: (sessions: SessionToDelete[]) => void;
  onPermanentlyDeleteSessions: (sessions: SessionToDelete[]) => void;
  onArchiveSessions: (sessions: SessionToDelete[]) => void;
  strings: Strings;
}

const Countdown: React.FC<{ deletedAt: string, strings: Strings }> = ({ deletedAt, strings }) => {
    const calculateTimeRemaining = () => {
        const deletedDate = new Date(deletedAt);
        const expiryDate = new Date(deletedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const now = new Date();
        const diff = expiryDate.getTime() - now.getTime();
        
        if (diff <= 0) return '0 days remaining';
        
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return strings.trash.daysRemaining.replace('{count}', String(days));
    };
    
    const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining());
        }, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [deletedAt]);

    return <span className="text-xs text-amber-600 dark:text-amber-500">{timeRemaining}</span>;
};

const RecentlyDeletedModal: React.FC<RecentlyDeletedModalProps> = ({ isOpen, onClose, records, onRestoreSessions, onPermanentlyDeleteSessions, onArchiveSessions, strings }) => {
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

    const deletedItems = useMemo(() => {
        const items: (ClothSession & { recordId: string; date: string })[] = [];
        records.forEach(record => {
            record.sessions.forEach(session => {
                if (session.deletedAt) {
                    items.push({
                        ...session,
                        recordId: record.id,
                        date: record.date,
                    });
                }
            });
        });
        return items.sort((a,b) => (b.deletedAt || '').localeCompare(a.deletedAt || ''));
    }, [records]);
    
    const handleRestore = (item: { recordId: string; id: string }) => {
        if(window.confirm(strings.trash.restoreSessionConfirmation)){
            onRestoreSessions([{ recordId: item.recordId, sessionId: item.id }]);
        }
    };

    const handlePermanentDelete = (item: { recordId: string; id: string }) => {
        if(window.confirm(strings.trash.deleteSessionConfirmation + `\n${strings.trash.permanentDeleteWarning}`)){
            onPermanentlyDeleteSessions([{ recordId: item.recordId, sessionId: item.id }]);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="modal-content-pane p-6 rounded-2xl max-w-md w-full flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-2">{strings.trash.title}</h3>
                <p className="text-sm text-[var(--secondary-text)] mb-4">{strings.trash.description}</p>
                
                <div className="border-t border-b border-[var(--border)] -mx-6 px-6 py-4 flex-1 overflow-y-auto">
                    {deletedItems.length > 0 ? (
                        <ul className="space-y-3">
                            {deletedItems.map(item => (
                                <li key={item.id} className="bg-[var(--bg)] p-3 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{item.clothType}</p>
                                            <p className="text-xs text-[var(--secondary-text)] mt-1">
                                                {strings.trash.deletedOn.replace('{date}', new Date(item.deletedAt!).toLocaleDateString())}
                                            </p>
                                        </div>
                                        <Countdown deletedAt={item.deletedAt!} strings={strings} />
                                    </div>
                                    <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                                        <button 
                                            onClick={() => handleRestore(item)}
                                            className="flex-1 py-2 text-sm font-semibold rounded-md hover:bg-[var(--surface)]"
                                        >
                                            {strings.trash.restore}
                                        </button>
                                        <button 
                                            onClick={() => handlePermanentDelete(item)}
                                            className="flex-1 py-2 text-sm font-semibold text-red-500 rounded-md hover:bg-[var(--surface)]"
                                        >
                                            {strings.trash.deleteForever}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-16 text-[var(--secondary-text)]">
                            <TrashIcon className="w-12 h-12 mx-auto opacity-20" />
                            <p className="mt-4 font-semibold">{strings.trash.empty}</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-4 flex-shrink-0">
                    <button onClick={() => setIsArchiveModalOpen(true)} className="flex-1 py-3 bg-[var(--bg)] rounded-lg font-semibold transition-colors hover:opacity-80">
                        {strings.trash.archiveSessions}
                    </button>
                     <button onClick={onClose} className="flex-1 py-3 bg-[var(--accent)] text-white rounded-lg font-semibold transition-colors hover:bg-[var(--accent-dark)]">
                        Close
                    </button>
                </div>
            </div>
            {isArchiveModalOpen && (
                <AdvancedDeleteModal 
                    records={records}
                    onClose={() => setIsArchiveModalOpen(false)}
                    onConfirmDelete={(sessions) => {
                        onArchiveSessions(sessions);
                        setIsArchiveModalOpen(false);
                    }}
                    strings={strings}
                />
            )}
        </div>
    );
};

export default RecentlyDeletedModal;