import React, { useMemo, useState, useEffect } from 'react';
import { DailyRecord, SessionToDelete, User, ClothSession, ClothTypePreset, Language } from '../types';
import { getStrings, getCategoryStyles } from '../constants';
import { ChevronDownIcon, TrashIcon, ExportIcon, ListBulletIcon } from './Icons';
import AdvancedDeleteModal from './AdvancedDeleteModal';
import ExportDataModal from './ExportDataModal';
import ManageClothTypesModal from './ManageClothTypesModal';
import EarningsTracker from './EarningsTracker';
import { calculateSessionEarnings, formatCurrency } from '../utils';
import LanguageSelectionModal from './LanguageSelectionModal';
import RecentlyDeletedModal from './RecentlyDeletedModal';

type Strings = ReturnType<typeof getStrings>;

const PageHeader: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
    <header className="p-4 flex-shrink-0 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        {children}
    </header>
);

const LogView: React.FC<{ records: DailyRecord[], strings: Strings }> = ({ records, strings }) => {
    const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>({});

    const groupedByMonth = useMemo(() => {
        const groups: { [key: string]: DailyRecord[] } = {};
        records.forEach(r => {
            const month = r.date.substring(0, 7); // YYYY-MM
            if (!groups[month]) groups[month] = [];
            groups[month].push(r);
        });
        return groups;
    }, [records]);
    
    useEffect(() => {
        // Automatically expand the current day on load
        const today = new Date().toISOString().split('T')[0];
        if (records.some(r => r.date === today)) {
            setExpandedDays(prev => ({ ...prev, [today]: true }));
        }
    }, [records]);

    if (records.length === 0) {
        return <div className="p-4 text-center text-[var(--secondary-text)]">{strings.noRecords}</div>;
    }
    
    return (
        <div className="space-y-6">
            {Object.entries(groupedByMonth).map(([month, monthRecords]) => {
                const monthlyTotalEarnings = (monthRecords as DailyRecord[]).reduce((total, record) => {
                    const dailyEarnings = record.sessions.reduce((dailyTotal, session) => {
                        return dailyTotal + calculateSessionEarnings(session);
                    }, 0);
                    return total + dailyEarnings;
                }, 0);

                return (
                    <div key={month}>
                        <div className="flex justify-between items-baseline mb-2 px-1">
                            <h2 className="font-bold text-lg">{new Date(month + '-02').toLocaleDateString(undefined, { timeZone: 'UTC', month: 'long', year: 'numeric' })}</h2>
                            {monthlyTotalEarnings > 0 && (
                                <p className="font-bold text-base text-[var(--accent)]">{formatCurrency(monthlyTotalEarnings)}</p>
                            )}
                        </div>
                        <div className="space-y-3">
                        {(monthRecords as DailyRecord[]).map(record => {
                            const dailyTotalEarnings = record.sessions.reduce((total, session) => total + calculateSessionEarnings(session), 0);

                            return (
                                <details key={record.date} open={!!expandedDays[record.date]} onToggle={(e) => setExpandedDays(prev => ({...prev, [record.date]: (e.target as HTMLDetailsElement).open}))}>
                                    <summary className="bg-[var(--surface)] p-4 rounded-xl flex justify-between items-center cursor-pointer">
                                        <div className="flex-1">
                                            <p className="font-bold">{new Date(record.date).toLocaleDateString(undefined, { timeZone: 'UTC', weekday: 'long', day: 'numeric' })}</p>
                                            {dailyTotalEarnings > 0 && (
                                                <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">{formatCurrency(dailyTotalEarnings)}</p>
                                            )}
                                        </div>
                                        <ChevronDownIcon className="w-5 h-5 transition-transform details-arrow flex-shrink-0 ml-2" />
                                    </summary>
                                    <div className="bg-[var(--surface)] p-4 rounded-b-xl -mt-2 space-y-3">
                                        {record.sessions.map((session, index) => {
                                            const sessionTotals: {[key: string]: number} = {};
                                            session.entries.forEach(entry => {
                                                Object.entries(entry.counts).forEach(([cat, count]) => {
                                                    sessionTotals[cat] = (sessionTotals[cat] || 0) + count;
                                                });
                                            });
                                            const grandTotal = Object.values(sessionTotals).reduce((sum: number, count: number) => sum + count, 0);
                                            const sessionEarnings = calculateSessionEarnings(session);

                                            return (
                                                <div key={session.id} className={`py-3 ${index < record.sessions.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                          <p className="font-semibold">{session.clothType}</p>
                                                          <div className="text-xs text-[var(--secondary-text)] mt-1 flex flex-wrap gap-x-2">
                                                              {Object.entries(sessionTotals).map(([cat, count]) => {
                                                                  const style = getCategoryStyles(strings)[cat];
                                                                  return (
                                                                    <span key={cat}>
                                                                        <span style={{ color: style ? style.color : 'var(--primary-text)', fontWeight: '600' }}>
                                                                            {cat}: {count}
                                                                        </span>
                                                                    </span>
                                                                  );
                                                              })}
                                                          </div>
                                                        </div>
                                                        <div className="text-sm flex-shrink-0 ml-4 text-right">
                                                            <p>{strings.total}: <span className="font-bold">{grandTotal}</span></p>
                                                            {sessionEarnings > 0 && (
                                                                <p className="font-semibold text-green-600 dark:text-green-400 text-xs">{formatCurrency(sessionEarnings)}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </details>
                            );
                        })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

interface WorkLogScreenProps {
  allRecords: DailyRecord[];
  visibleRecords: DailyRecord[];
  users: User[];
  onArchiveSessions: (sessionsToArchive: SessionToDelete[]) => void;
  onRestoreSessions: (sessionsToRestore: SessionToDelete[]) => void;
  onPermanentlyDeleteSessions: (sessionsToDelete: SessionToDelete[]) => void;
  activeUser: User | undefined;
  onUpdateUser: (updatedData: Partial<User>) => void;
  onUpdateUserPresets: (userId: string, presets: ClothTypePreset[]) => void;
  isManagePresetsModalRequested?: boolean;
  onManagePresetsModalClosed?: () => void;
  strings: Strings;
  onUpdateLanguage: (lang: Language) => void;
}

const WorkLogScreen: React.FC<WorkLogScreenProps> = ({ 
    allRecords, visibleRecords, users, onArchiveSessions, onRestoreSessions, onPermanentlyDeleteSessions,
    activeUser, onUpdateUser, onUpdateUserPresets,
    isManagePresetsModalRequested, onManagePresetsModalClosed, strings, onUpdateLanguage
}) => {
  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isManagePresetsOpen, setIsManagePresetsOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  useEffect(() => {
    if (isManagePresetsModalRequested) {
        setIsManagePresetsOpen(true);
    }
  }, [isManagePresetsModalRequested]);

  const handleUpdatePresets = (newPresets: ClothTypePreset[]) => {
    if (activeUser) {
      onUpdateUserPresets(activeUser.id, newPresets);
    }
  };
  
  const handleCloseManagePresets = () => {
    setIsManagePresetsOpen(false);
    if (onManagePresetsModalClosed) {
        onManagePresetsModalClosed();
    }
  };

  const languageName = useMemo(() => {
    switch (activeUser?.language) {
        case 'hi': return strings.hinglish;
        case 'hn': return strings.hindi;
        case 'en':
        default:
            return strings.english;
    }
  }, [activeUser?.language, strings]);

  return (
    <div className="h-full flex flex-col">
        <PageHeader title={strings.logTitle}>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsLanguageModalOpen(true)}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-full hover:bg-[var(--accent-subtle)] transition-colors"
                    title={strings.selectLanguageTitle}
                >
                    <span className="font-semibold text-sm text-[var(--primary-text)]">
                        {languageName}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 text-[var(--secondary-text)]" />
                </button>
                <button
                    onClick={() => setIsManagePresetsOpen(true)}
                    className="text-[var(--secondary-text)] hover:text-[var(--accent)] p-2"
                    title={strings.manageClothTypes}
                >
                    <ListBulletIcon className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="text-[var(--secondary-text)] hover:text-[var(--accent)] p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isOnline ? strings.exportData : "Export requires an internet connection"}
                    disabled={!isOnline}
                >
                    <ExportIcon className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setIsTrashModalOpen(true)}
                    className="text-[var(--secondary-text)] hover:text-red-500 p-2"
                    title={strings.manageTrash}
                >
                    <TrashIcon className="w-6 h-6" />
                </button>
            </div>
        </PageHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
            {activeUser && <EarningsTracker user={activeUser} records={visibleRecords} onUpdateUser={onUpdateUser} strings={strings} />}
            <div className="mt-6">
                <LogView records={visibleRecords} strings={strings} />
            </div>
        </div>
        {isTrashModalOpen && <RecentlyDeletedModal
            isOpen={isTrashModalOpen}
            onClose={() => setIsTrashModalOpen(false)}
            records={allRecords}
            onRestoreSessions={onRestoreSessions}
            onPermanentlyDeleteSessions={onPermanentlyDeleteSessions}
            onArchiveSessions={onArchiveSessions}
            strings={strings}
        />}
        {isExportModalOpen && <ExportDataModal 
            users={users}
            onClose={() => setIsExportModalOpen(false)}
            strings={strings}
        />}
        {isManagePresetsOpen && activeUser && <ManageClothTypesModal
            presets={activeUser.clothTypePresets}
            onClose={handleCloseManagePresets}
            onSave={handleUpdatePresets}
            strings={strings}
        />}
        {isLanguageModalOpen && activeUser && (
            <LanguageSelectionModal
                isOpen={isLanguageModalOpen}
                onClose={() => setIsLanguageModalOpen(false)}
                onSelect={onUpdateLanguage}
                currentLanguage={activeUser.language}
                strings={strings}
            />
        )}
    </div>
  );
};

export default WorkLogScreen;