import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import TrackerScreen from './components/TrackerScreen';
import WorkLogScreen from './components/WorkLogScreen';
import InsightsScreen from './components/InsightsScreen';
import SetupScreen from './components/SetupScreen';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DailyRecord, View, User, SessionToDelete, ClothTypePreset, Language } from './types';
import { getStrings } from './constants';
import { TrackerIcon, LogIcon, MunshiJiIcon } from './components/Icons';

interface AppData {
  users: User[];
  activeUserId: string | null;
}

const App: React.FC = () => {
  const [appData, setAppData] = useLocalStorage<AppData>('garmentTrackerData', { users: [], activeUserId: null });
  const [isSetupComplete, setIsSetupComplete] = useLocalStorage('isSetupComplete', false);
  const [currentView, setCurrentView] = useState<View>('tracker');
  const [previousView, setPreviousView] = useState<View | null>(null);
  const [isManagePresetsModalRequested, setIsManagePresetsModalRequested] = useState(false);
  const cleanupRef = useRef(false);

  // When the current view changes, set the previous view to start the exit animation.
  const changeView = (newView: View) => {
    if (newView !== currentView) {
      setPreviousView(currentView);
      setCurrentView(newView);
    }
  };
  
  // After the animation duration, remove the previous view from the DOM.
  useEffect(() => {
    if (previousView) {
      const timer = setTimeout(() => {
        setPreviousView(null);
      }, 300); // Must match CSS animation duration
      return () => clearTimeout(timer);
    }
  }, [previousView]);

  // One-time migration from old single-user data structure to the new multi-user one.
  useEffect(() => {
    const rawNewData = localStorage.getItem('garmentTrackerData');
    if (rawNewData && JSON.parse(rawNewData).users.length > 0) {
      return; // Already migrated or new install
    }

    const rawOldRecords = localStorage.getItem('dailyRecords');
    const rawOldActiveId = localStorage.getItem('activeRecordId');

    if (rawOldRecords) {
      console.log("Migrating old data to new multi-user structure...");
      try {
        const oldRecords: DailyRecord[] = JSON.parse(rawOldRecords);
        const oldActiveId: string | null = rawOldActiveId ? JSON.parse(rawOldActiveId) : null;
        
        const sortedOldRecords = oldRecords.sort((a,b) => a.date.localeCompare(b.date));
        
        const getFirstTimestamp = () => {
          if (sortedOldRecords.length > 0) {
            return `${sortedOldRecords[0].date}T00:00:00.000Z`;
          }
          return new Date().toISOString();
        };

        if (Array.isArray(oldRecords)) {
          const defaultUser: User = {
            id: `user-${Date.now()}`,
            name: 'My Work',
            dailyRecords: sortedOldRecords.reverse(),
            activeRecordId: oldActiveId,
            clothTypePresets: [],
            earningsGoal: 0,
            earningsStart: getFirstTimestamp(),
            language: 'en',
          };

          setAppData({
            users: [defaultUser],
            activeUserId: defaultUser.id,
          });

          localStorage.removeItem('dailyRecords');
          localStorage.removeItem('activeRecordId');
          setIsSetupComplete(true); // Mark setup as complete for migrated users
          console.log("Migration successful.");
        }
      } catch (e) {
        console.error("Failed to migrate old data", e);
      }
    }
  }, []); // Run only once on mount

  // Auto-purge items from trash older than 7 days on app load.
  useEffect(() => {
    if (appData.users.length === 0 || cleanupRef.current) return;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let itemsWerePurged = false;
    const cleanedUsers = appData.users.map(user => {
        const newDailyRecords = user.dailyRecords.map(record => {
            const sessionsToKeep = record.sessions.filter(session => {
                if (session.deletedAt) {
                    const deletedDate = new Date(session.deletedAt);
                    if (deletedDate < sevenDaysAgo) {
                        itemsWerePurged = true;
                        return false; // Purge this session
                    }
                }
                return true; // Keep this session
            });
            return { ...record, sessions: sessionsToKeep };
        }).filter(record => record.sessions.length > 0);
        return { ...user, dailyRecords: newDailyRecords };
    });

    if (itemsWerePurged) {
        console.log("Purged old items from trash.");
        setAppData(prev => ({ ...prev, users: cleanedUsers }));
    }
    cleanupRef.current = true;
  }, [appData.users, setAppData]);

  // Ensure there is at least one user profile.
  useEffect(() => {
    if (appData.users.length === 0) {
      const firstUser: User = {
        id: `user-${Date.now()}`,
        name: 'My Work', // This will be updated by the setup screen
        dailyRecords: [],
        activeRecordId: null,
        clothTypePresets: [],
        earningsGoal: 0,
        earningsStart: new Date().toISOString(),
        language: 'en', // Default, will be updated
      };
      setAppData({
        users: [firstUser],
        activeUserId: firstUser.id,
      });
    }
  }, [appData.users.length, setAppData]);

  const activeUser = appData.users.find(u => u.id === appData.activeUserId);
  const STRINGS = getStrings(activeUser?.language);
  
  // Create a memoized list of records that are NOT soft-deleted, for display in the main UI.
  const visibleRecords = useMemo(() => {
    if (!activeUser) return [];
    // Map over records to filter out soft-deleted sessions.
    // Do NOT filter out records that become empty, as the active record for a new day will be empty.
    return activeUser.dailyRecords.map(record => ({
        ...record,
        sessions: record.sessions.filter(session => !session.deletedAt),
    }));
  }, [activeUser]);

  const activeRecordId = activeUser?.activeRecordId;
  const activeRecord = visibleRecords.find(r => r.id === activeRecordId);

  const updateUser = (userId: string, updatedUserData: Partial<User>) => {
    setAppData(prevData => ({
      ...prevData,
      users: prevData.users.map(u =>
        u.id === userId ? { ...u, ...updatedUserData } : u
      )
    }));
  };
  
  const handleSetupComplete = (name: string, language: Language) => {
    if (activeUser) {
      updateUser(activeUser.id, { name, language });
    }
    setIsSetupComplete(true);
  };

  const addUser = (name: string) => {
    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        dailyRecords: [],
        activeRecordId: null,
        clothTypePresets: [],
        earningsGoal: 0,
        earningsStart: new Date().toISOString(),
        language: 'en',
    };
    setAppData(prev => ({
        users: [...prev.users, newUser],
        activeUserId: newUser.id,
    }));
  };
  
  const handleUpdateActiveUser = (updatedData: Partial<User>) => {
    if (!activeUser) return;
    updateUser(activeUser.id, updatedData);
  };
  
  const handleUpdateLanguage = (lang: Language) => {
    if (!activeUser) return;
    updateUser(activeUser.id, { language: lang });
  };

  const switchUser = (userId: string) => {
    setAppData(prev => ({ ...prev, activeUserId: userId }));
  };

  const renameUser = (userId: string, newName: string) => {
    if (!newName.trim()) return;
    setAppData(prevData => ({
        ...prevData,
        users: prevData.users.map(u => 
            u.id === userId ? { ...u, name: newName.trim() } : u
        )
    }));
  };

  const updateUserPresets = (userId: string, presets: ClothTypePreset[]) => {
    updateUser(userId, { clothTypePresets: presets });
  };
  
  const setActiveRecordId = (recordId: string | null) => {
    if (!activeUser) return;
    updateUser(activeUser.id, { activeRecordId: recordId });
  }

  const updateActiveRecord = (updatedRecord: DailyRecord) => {
    if (!activeUser) return;
    const newRecords = activeUser.dailyRecords.map(r => r.id === updatedRecord.id ? updatedRecord : r);
    const sortedRecords = newRecords.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    updateUser(activeUser.id, { dailyRecords: sortedRecords });
  };

  const archiveSessions = (sessionsToArchive: SessionToDelete[]) => {
    if (!activeUser) return;

    const sessionsToArchiveMap = new Map<string, Set<string>>();
    sessionsToArchive.forEach(item => {
      if (!sessionsToArchiveMap.has(item.recordId)) {
        sessionsToArchiveMap.set(item.recordId, new Set());
      }
      sessionsToArchiveMap.get(item.recordId)!.add(item.sessionId);
    });

    const newDailyRecords = activeUser.dailyRecords.map(record => {
      const sessionsToArchiveForRecord = sessionsToArchiveMap.get(record.id);
      if (!sessionsToArchiveForRecord) {
        return record;
      }

      const newSessions = record.sessions.map(session => {
        if (sessionsToArchiveForRecord.has(session.id)) {
          return { ...session, deletedAt: new Date().toISOString() };
        }
        return session;
      });
      return { ...record, sessions: newSessions };
    });

    updateUser(activeUser.id, { dailyRecords: newDailyRecords });
  };

  const restoreSessions = (sessionsToRestore: SessionToDelete[]) => {
    if (!activeUser) return;
    const sessionsToRestoreMap = new Map<string, Set<string>>();
    sessionsToRestore.forEach(item => {
      if (!sessionsToRestoreMap.has(item.recordId)) {
        sessionsToRestoreMap.set(item.recordId, new Set());
      }
      sessionsToRestoreMap.get(item.recordId)!.add(item.sessionId);
    });

    const newDailyRecords = activeUser.dailyRecords.map(record => {
      const sessionsToRestoreForRecord = sessionsToRestoreMap.get(record.id);
      if (!sessionsToRestoreForRecord) {
        return record;
      }
      const newSessions = record.sessions.map(session => {
        if (sessionsToRestoreForRecord.has(session.id)) {
          const { deletedAt, ...restoredSession } = session;
          return restoredSession;
        }
        return session;
      });
      return { ...record, sessions: newSessions };
    });
    updateUser(activeUser.id, { dailyRecords: newDailyRecords });
  };

  const permanentlyDeleteSessions = (sessionsToDelete: SessionToDelete[]) => {
    if (!activeUser) return;
    const sessionsToDeleteMap = new Map<string, Set<string>>();
    sessionsToDelete.forEach(item => {
      if (!sessionsToDeleteMap.has(item.recordId)) {
        sessionsToDeleteMap.set(item.recordId, new Set());
      }
      sessionsToDeleteMap.get(item.recordId)!.add(item.sessionId);
    });

    const newDailyRecords = activeUser.dailyRecords.map(record => {
      const sessionsToDeleteForRecord = sessionsToDeleteMap.get(record.id);
      if (!sessionsToDeleteForRecord) {
        return record;
      }
      const newSessions = record.sessions.filter(session => !sessionsToDeleteForRecord.has(session.id));
      return { ...record, sessions: newSessions };
    }).filter(record => record.sessions.length > 0);

    updateUser(activeUser.id, { dailyRecords: newDailyRecords });
  };


  const ensureActiveRecord = useCallback(() => {
    if (!activeUser) return;
    if (activeRecordId && visibleRecords.find(r => r.id === activeRecordId)) {
        return;
    }

    const newRecord: DailyRecord = {
        id: `${new Date().toISOString()}-${Math.random()}`,
        date: new Date().toISOString().split('T')[0],
        sessions: [], // Start with no sessions. User will add one.
    };

    const newRecords = [...activeUser.dailyRecords, newRecord].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    updateUser(activeUser.id, { dailyRecords: newRecords, activeRecordId: newRecord.id });
  }, [activeUser, activeRecordId, visibleRecords]);

  const handleChangeDate = (newDate: string) => {
    if (!activeUser || activeRecord?.date === newDate) return;

    const recordsForNewDate = visibleRecords
      .filter(r => r.date === newDate)
      .sort((a, b) => b.id.localeCompare(a.id));

    if (recordsForNewDate.length > 0) {
      setActiveRecordId(recordsForNewDate[0].id);
    } else {
      const newRecord: DailyRecord = {
        id: `${new Date().toISOString()}-${Math.random()}`,
        date: newDate,
        sessions: [], // Start with no sessions. User will add one.
      };
      const newRecords = [...activeUser.dailyRecords, newRecord].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
      updateUser(activeUser.id, { dailyRecords: newRecords, activeRecordId: newRecord.id });
    }
  };
  
  const getAnimationClass = (view: View): string => {
    const viewOrder: View[] = ['tracker', 'log', 'insights'];
    const fromIndex = viewOrder.indexOf(previousView as View);
    const toIndex = viewOrder.indexOf(currentView);
    
    if (view === previousView) {
      if (fromIndex < toIndex) return 'page-slide-exit-left';
      if (fromIndex > toIndex) return 'page-slide-exit-right';
    }
    if (view === currentView && previousView) {
      if (fromIndex < toIndex) return 'page-slide-enter-right';
      if (fromIndex > toIndex) return 'page-slide-enter-left';
    }
    return '';
  };
  
  const openManagePresets = () => {
    setIsManagePresetsModalRequested(true);
    changeView('log');
  };

  const onManagePresetsModalClosed = () => {
    setIsManagePresetsModalRequested(false);
  };

  if (!isSetupComplete || !activeUser) {
    return <SetupScreen onSetupComplete={handleSetupComplete} />;
  }

  const isTrackerVisible = currentView === 'tracker' || previousView === 'tracker';
  const isLogVisible = currentView === 'log' || previousView === 'log';
  const isInsightsVisible = currentView === 'insights' || previousView === 'insights';


  return (
    <div className="bg-[var(--bg)] h-[100dvh] text-[var(--primary-text)] flex flex-col">
      <main className="flex-1 overflow-hidden relative">
        {isTrackerVisible && (
            <div className={`page-container ${getAnimationClass('tracker')}`}>
                <TrackerScreen
                    key={`${activeUser?.id}-tracker`}
                    activeRecord={activeRecord}
                    allRecords={visibleRecords}
                    updateActiveRecord={updateActiveRecord}
                    onRecordNeeded={ensureActiveRecord}
                    onChangeDate={handleChangeDate}
                    users={appData.users}
                    activeUser={activeUser}
                    onSwitchUser={switchUser}
                    onAddUser={addUser}
                    onRenameUser={renameUser}
                    onRequestManagePresets={openManagePresets}
                    strings={STRINGS}
                />
            </div>
        )}
        {isLogVisible && (
            <div className={`page-container ${getAnimationClass('log')}`}>
                <WorkLogScreen 
                    key={`${activeUser?.id}-log`}
                    allRecords={activeUser?.dailyRecords || []}
                    visibleRecords={visibleRecords}
                    users={appData.users}
                    onArchiveSessions={archiveSessions}
                    onRestoreSessions={restoreSessions}
                    onPermanentlyDeleteSessions={permanentlyDeleteSessions}
                    activeUser={activeUser}
                    onUpdateUser={handleUpdateActiveUser}
                    onUpdateUserPresets={updateUserPresets}
                    isManagePresetsModalRequested={isManagePresetsModalRequested}
                    onManagePresetsModalClosed={onManagePresetsModalClosed}
                    strings={STRINGS}
                    onUpdateLanguage={handleUpdateLanguage}
                />
            </div>
        )}
        {isInsightsVisible && activeUser && (
            <div className={`page-container ${getAnimationClass('insights')}`}>
                <InsightsScreen 
                    key={`${activeUser.id}-insights`}
                    activeUser={activeUser}
                    visibleRecords={visibleRecords}
                    strings={STRINGS}
                />
            </div>
        )}
      </main>
      <nav className="bottom-nav flex-shrink-0">
        <div className="container mx-auto px-4 py-2 flex justify-around items-center max-w-2xl">
          <NavButton 
            label={STRINGS.trackerNav} 
            icon={<TrackerIcon />} 
            isActive={currentView === 'tracker'} 
            onClick={() => changeView('tracker')} 
          />
          <NavButton 
            label={STRINGS.logNav} 
            icon={<LogIcon />} 
            isActive={currentView === 'log'} 
            onClick={() => changeView('log')} 
          />
          <NavButton 
            label={STRINGS.munshiNav} 
            icon={<MunshiJiIcon />} 
            isActive={currentView === 'insights'} 
            onClick={() => changeView('insights')} 
          />
        </div>
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void }> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 w-20 h-14 rounded-lg transition-colors ${isActive ? 'text-[var(--accent)]' : 'text-[var(--secondary-text)] hover:bg-[var(--bg)]'}`}
    aria-current={isActive ? 'page' : undefined}
  >
    <div className="w-6 h-6">{icon}</div>
    <span className="text-xs font-semibold">{label}</span>
  </button>
);

export default App;