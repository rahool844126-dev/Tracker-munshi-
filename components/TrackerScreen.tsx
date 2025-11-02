import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DailyRecord, Entry, ClothSession, User, ClothTypePreset } from '../types';
import Summary from './Summary';
import EntriesList from './EntriesList';
import CalendarModal from './CalendarModal';
import UserManagementModal from './UserManagementModal';
import SelectClothTypeModal from './SelectClothTypeModal';
import { getStrings, getDefaultCategories, getCategoryStyles } from '../constants';
import { PlusIcon, BackspaceIcon, TrashIcon, UserIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon, TrackerIcon, ListBulletIcon } from './Icons';

type Strings = ReturnType<typeof getStrings>;

const triggerHapticFeedback = (duration: number = 10) => {
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(duration);
    }
};

const Numpad: React.FC<{
  onAdd: (entry: Omit<Entry, 'id' | 'timestamp'>) => void;
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  onManageCategories: () => void;
  numpadAddButtonRef: React.RefObject<HTMLButtonElement>;
  isTransitioning: boolean;
  strings: Strings;
}> = ({ onAdd, categories, activeCategory, setActiveCategory, onManageCategories, numpadAddButtonRef, isTransitioning, strings }) => {
  const [value, setValue] = useState('');

  const handleNumpadClick = (char: string) => {
    triggerHapticFeedback();
    if (char === 'del') {
      setValue(v => v.slice(0, -1));
    } else if (value.length < 5) {
      // Prevent leading zeros
      if (value === '0') {
        setValue(char);
      } else {
        setValue(v => v + char);
      }
    }
  };

  const handleSubmit = () => {
    const numValue = parseInt(value, 10);
    if (!numValue || isNaN(numValue) || !activeCategory) return;

    triggerHapticFeedback(50); // A stronger vibration for confirmation
    onAdd({ counts: { [activeCategory]: numValue } });
    setValue('');
  };

  const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'del'];

  return (
    <div className="p-4 pt-2">
      <div className="relative text-right text-5xl font-bold h-14 mb-3 truncate flex items-center justify-end">
        <span className="text-[var(--secondary-text)] mr-2">{activeCategory}</span>
        <span>{value || '0'}</span>
      </div>
      <div className="flex items-center gap-2 mb-3 pb-1 overflow-x-auto category-scrollbar">
        {categories.map(cat => {
            const style = getCategoryStyles(strings)[cat];
            const isActive = activeCategory === cat;
            const activeClasses = 'bg-[var(--accent)] text-white';
            const inactiveClasses = 'bg-[var(--bg)] hover:bg-[var(--accent-subtle)]';
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`py-2 px-4 text-sm font-bold rounded-lg flex-shrink-0 transition-colors ${isActive ? activeClasses : inactiveClasses}`}
                style={{
                    color: !isActive && style ? style.color : undefined,
                }}
              >
                {cat}
              </button>
            );
        })}
        <button
          onClick={onManageCategories}
          className="py-2 px-3 text-sm font-bold rounded-lg flex-shrink-0 transition-colors bg-[var(--bg)] hover:bg-[var(--accent-subtle)] flex items-center justify-center h-10 w-10 text-[var(--secondary-text)]"
          title={strings.manageCategories}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {numpadKeys.map(key => (
          <button key={key} onClick={() => handleNumpadClick(key)} className="numpad-btn numpad-btn-spring h-16">
            {key === 'del' ? <BackspaceIcon /> : key}
          </button>
        ))}
        <button 
            ref={numpadAddButtonRef}
            onClick={handleSubmit} 
            className="numpad-btn-accent numpad-btn-spring h-16 rounded-3xl"
            style={{ visibility: isTransitioning ? 'hidden' : 'visible' }}
        >
          {strings.addEntryButton}
        </button>
      </div>
    </div>
  );
};

const ManageCategoriesModal: React.FC<{
    customCategories: string[];
    allSessionCategories: string[];
    onAdd: (name: string) => void;
    onDelete: (name: string) => void;
    onClose: () => void;
    strings: Strings;
}> = ({ customCategories, allSessionCategories, onAdd, onDelete, onClose, strings }) => {
    const [name, setName] = useState('');
    const presets = [strings.yarnCategory, strings.secondOkCategory];

    const handleAdd = () => {
        const trimmedName = name.trim();
        if (trimmedName) {
            onAdd(trimmedName);
            setName(''); // Clear input after adding
        }
    };
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="modal-content-pane p-6 rounded-2xl max-w-sm w-full flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4 flex-shrink-0">{strings.manageCategories}</h3>
                
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                    {customCategories.length > 0 ? customCategories.map(cat => (
                        <div key={cat} className="flex justify-between items-center bg-[var(--bg)] p-2 rounded-lg">
                            <span>{cat}</span>
                            <button onClick={() => onDelete(cat)} className="text-[var(--secondary-text)] hover:text-red-500 p-1" title={`${strings.deleteCategory} ${cat}`}>
                                <TrashIcon />
                            </button>
                        </div>
                    )) : (
                        <p className="text-sm text-[var(--secondary-text)] text-center py-4">No custom categories added yet.</p>
                    )}
                </div>

                <div className="flex-shrink-0">
                    <div className="mb-4">
                        <p className="text-sm font-semibold mb-2">{strings.addPresets}</p>
                        <div className="flex gap-2 flex-wrap">
                            {presets.map(preset => {
                                const alreadyExists = allSessionCategories.some(cat => cat.toLowerCase() === preset.toLowerCase());
                                const style = getCategoryStyles(strings)[preset];
                                return (
                                    <button
                                        key={preset}
                                        onClick={() => onAdd(preset)}
                                        disabled={alreadyExists}
                                        className="py-2 px-3 text-sm font-bold rounded-lg transition-colors bg-[var(--bg)] disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-[var(--border)]"
                                        style={{ color: style ? style.color : undefined }}
                                    >
                                        + {preset}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <p className="text-sm font-semibold mb-2">{strings.addCategory}</p>
                    <div className="flex gap-3">
                        <input
                            type="text" value={name} onChange={(e) => setName(e.target.value)}
                            className="flex-1 p-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                            placeholder={strings.categoryNamePlaceholder}
                        />
                        <button onClick={handleAdd} className="py-3 px-5 bg-[var(--accent)] text-white rounded-lg font-semibold disabled:opacity-50" disabled={!name.trim()}>{strings.save}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface TrackerScreenProps {
  activeRecord: DailyRecord | undefined;
  allRecords: DailyRecord[];
  updateActiveRecord: (record: DailyRecord) => void;
  onRecordNeeded: () => void;
  onChangeDate: (newDate: string) => void;
  users: User[];
  activeUser: User | undefined;
  onSwitchUser: (userId: string) => void;
  onAddUser: (name: string) => void;
  onRenameUser: (userId: string, newName: string) => void;
  onRequestManagePresets: () => void;
  strings: Strings;
}

const PlusIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6"></path></svg>`;

const TrackerScreen: React.FC<TrackerScreenProps> = ({ 
    activeRecord, allRecords, updateActiveRecord, onRecordNeeded, onChangeDate,
    users, activeUser, onSwitchUser, onAddUser, onRenameUser,
    onRequestManagePresets,
    strings
}) => {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isNumpadOpen, setIsNumpadOpen] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(getDefaultCategories(strings)[0]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [isFabTransitioning, setIsFabTransitioning] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const numpadAddButtonRef = useRef<HTMLButtonElement>(null);
  const fabCloneRef = useRef<HTMLDivElement>(null);
  const numpadSheetRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    startY: 0,
    currentTranslateY: 0,
    isDragging: false,
  });

  const handleAddEntry = useCallback((newEntryData: Omit<Entry, 'id' | 'timestamp'>) => {
    if (!activeSessionId || !activeRecord) return;
    const newEntry: Entry = {
      ...newEntryData,
      id: new Date().toISOString() + Math.random(),
      timestamp: new Date().toISOString(),
    };
    const updatedSessions = activeRecord.sessions.map(s => 
      s.id === activeSessionId ? { ...s, entries: [newEntry, ...s.entries] } : s
    );
    updateActiveRecord({ ...activeRecord, sessions: updatedSessions });
  }, [activeSessionId, activeRecord, updateActiveRecord]);

  const handleOpenNumpadWithAnimation = useCallback(() => {
    if (isNumpadOpen || !fabRef.current || !fabCloneRef.current) return;

    setActiveCategory(getDefaultCategories(strings)[0]);

    const fabNode = fabRef.current;
    const cloneNode = fabCloneRef.current;
    const fabRect = fabNode.getBoundingClientRect();

    cloneNode.innerHTML = `<div class="fab-icon" style="opacity: 1;">${PlusIconSvg}</div><div class="fab-text" style="opacity: 0;">${strings.addEntryButton}</div>`;
    cloneNode.style.display = 'flex';
    cloneNode.style.left = `${fabRect.left}px`;
    cloneNode.style.top = `${fabRect.top}px`;
    cloneNode.style.width = `${fabRect.width}px`;
    cloneNode.style.height = `${fabRect.height}px`;
    cloneNode.style.borderRadius = '9999px';

    setIsFabTransitioning(true);
    setIsNumpadOpen(true);
    triggerHapticFeedback();
    
    // Defer target calculation until numpad is rendered
    requestAnimationFrame(() => {
        setTimeout(() => {
            const targetNode = numpadAddButtonRef.current;
            if (!targetNode) return;
            const targetRect = targetNode.getBoundingClientRect();
            
            cloneNode.style.left = `${targetRect.left}px`;
            cloneNode.style.top = `${targetRect.top}px`;
            cloneNode.style.width = `${targetRect.width}px`;
            cloneNode.style.height = `${targetRect.height}px`;
            cloneNode.style.borderRadius = '1.5rem'; // numpad-btn-accent has rounded-3xl -> 1.5rem

            const icon = cloneNode.querySelector<HTMLElement>('.fab-icon');
            const text = cloneNode.querySelector<HTMLElement>('.fab-text');
            if(icon) icon.style.opacity = '0';
            if(text) text.style.opacity = '1';
        }, 50); // A small delay for safety
    });

    const onTransitionEnd = () => {
        setIsFabTransitioning(false);
        cloneNode.style.display = 'none';
        cloneNode.removeEventListener('transitionend', onTransitionEnd);
    };
    cloneNode.addEventListener('transitionend', onTransitionEnd);
  }, [isNumpadOpen, strings]);


  const handleCloseNumpadWithAnimation = useCallback((entryData?: Omit<Entry, 'id' | 'timestamp'>) => {
    if (!isNumpadOpen || !fabRef.current || !fabCloneRef.current || !numpadAddButtonRef.current) return;
    
    if (entryData) {
        handleAddEntry(entryData);
    }
    
    const fabNode = fabRef.current;
    const cloneNode = fabCloneRef.current;
    const targetNode = numpadAddButtonRef.current;

    const targetRect = targetNode.getBoundingClientRect();
    
    cloneNode.innerHTML = `<div class="fab-icon" style="opacity: 0;">${PlusIconSvg}</div><div class="fab-text" style="opacity: 1;">${strings.addEntryButton}</div>`;
    cloneNode.style.display = 'flex';
    cloneNode.style.left = `${targetRect.left}px`;
    cloneNode.style.top = `${targetRect.top}px`;
    cloneNode.style.width = `${targetRect.width}px`;
    cloneNode.style.height = `${targetRect.height}px`;
    cloneNode.style.borderRadius = '1.5rem';

    setIsFabTransitioning(true);

    requestAnimationFrame(() => {
        setTimeout(() => {
            const fabRect = fabNode.getBoundingClientRect();
            cloneNode.style.left = `${fabRect.left}px`;
            cloneNode.style.top = `${fabRect.top}px`;
            cloneNode.style.width = `${fabRect.width}px`;
            cloneNode.style.height = `${fabRect.height}px`;
            cloneNode.style.borderRadius = '9999px';

            const icon = cloneNode.querySelector<HTMLElement>('.fab-icon');
            const text = cloneNode.querySelector<HTMLElement>('.fab-text');
            if(icon) icon.style.opacity = '1';
            if(text) text.style.opacity = '0';

            setIsNumpadOpen(false);
        }, 50);
    });
    
    const onTransitionEnd = () => {
        cloneNode.style.display = 'none';
        setIsFabTransitioning(false);
        cloneNode.removeEventListener('transitionend', onTransitionEnd);
    };
    cloneNode.addEventListener('transitionend', onTransitionEnd);

  }, [isNumpadOpen, handleAddEntry, strings]);

  const handleCloseNumpadViaDrag = useCallback(() => {
    if (!isNumpadOpen) return;
    setIsNumpadOpen(false);
    triggerHapticFeedback();
  }, [isNumpadOpen]);

  const handleDragStart = useCallback((e: React.TouchEvent) => {
      if (!isNumpadOpen) return;
      dragState.current.isDragging = true;
      dragState.current.startY = e.touches[0].clientY;
      dragState.current.currentTranslateY = 0;
      if (numpadSheetRef.current) {
          numpadSheetRef.current.style.transition = 'none';
      }
  }, [isNumpadOpen]);

  const handleDragMove = useCallback((e: React.TouchEvent) => {
      if (!dragState.current.isDragging || !numpadSheetRef.current) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - dragState.current.startY;
      
      if (deltaY >= 0) {
          dragState.current.currentTranslateY = deltaY;
          numpadSheetRef.current.style.transform = `translateY(${deltaY}px)`;
      }
  }, []);

  const handleDragEnd = useCallback(() => {
      if (!dragState.current.isDragging || !numpadSheetRef.current) return;
      
      const sheetHeight = numpadSheetRef.current.offsetHeight;
      const closeThreshold = sheetHeight * 0.4; // Close if dragged 40%

      if (dragState.current.currentTranslateY > closeThreshold) {
          handleCloseNumpadViaDrag();
      } else {
          numpadSheetRef.current.style.transition = 'transform 0.3s ease-in-out';
          numpadSheetRef.current.style.transform = 'translateY(0px)';
          
          setTimeout(() => {
              if (numpadSheetRef.current && !dragState.current.isDragging) {
                  numpadSheetRef.current.style.transform = '';
              }
          }, 300);
      }
      
      dragState.current.isDragging = false;
  }, [handleCloseNumpadViaDrag]);

  useEffect(() => {
    if (numpadSheetRef.current) {
        // If the numpad is closed, ensure any inline transform from dragging is removed
        // so the CSS class-based animation can take over.
        if (!isNumpadOpen && numpadSheetRef.current.style.transform) {
            numpadSheetRef.current.style.transform = '';
        }
    }
  }, [isNumpadOpen]);

  useEffect(() => {
    if (!activeRecord) {
        onRecordNeeded();
    }
  }, [activeRecord, onRecordNeeded]);
  
  useEffect(() => {
    if (activeRecord) {
      const currentActiveSessionExists = activeRecord.sessions.some(s => s.id === activeSessionId);
      
      if (activeRecord.sessions.length > 0 && currentActiveSessionExists) {
        // If the record changes (e.g., date change), but the old session ID is still valid, do nothing.
      } else if (activeRecord.sessions.length > 0) {
        // Default to the last session if current one is invalid or not set
        const lastSessionId = activeRecord.sessions[activeRecord.sessions.length - 1].id;
        setActiveSessionId(lastSessionId);
      } else {
        // If there are no sessions, there is no active session
        setActiveSessionId(null);
      }
    }
  }, [activeRecord]);

  const activeSession = activeRecord?.sessions.find(s => s.id === activeSessionId);

  const handleDeleteEntry = (entryId: string) => {
    if (!activeSessionId || !activeRecord) return;
    const updatedSessions = activeRecord.sessions.map(s => 
      s.id === activeSessionId ? { ...s, entries: s.entries.filter(e => e.id !== entryId) } : s
    );
    updateActiveRecord({ ...activeRecord, sessions: updatedSessions });
  };

  const handleAddCustomCategory = (categoryName: string) => {
    if (!activeSessionId || !activeRecord) return;
    const defaultCategories = getDefaultCategories(strings);
    const updatedSessions = activeRecord.sessions.map(s => {
      if (s.id === activeSessionId) {
        if ([...defaultCategories, ...s.customCategories].find(c => c.toLowerCase() === categoryName.toLowerCase())) return s;
        return { ...s, customCategories: [...s.customCategories, categoryName] };
      }
      return s;
    });
    updateActiveRecord({ ...activeRecord, sessions: updatedSessions });
    setActiveCategory(categoryName);
  };

  const handleDeleteCustomCategory = (categoryName: string) => {
    if (!activeSessionId || !activeRecord) return;
    
    const confirmationMessage = strings.deleteCategoryConfirmation.replace('{categoryName}', categoryName);
    if (window.confirm(confirmationMessage)) {
        const updatedSessions = activeRecord.sessions.map(s => {
            if (s.id === activeSessionId) {
                return { ...s, customCategories: s.customCategories.filter(c => c !== categoryName) };
            }
            return s;
        });
        updateActiveRecord({ ...activeRecord, sessions: updatedSessions });
        if (activeCategory === categoryName) {
            setActiveCategory(getDefaultCategories(strings)[0]);
        }
    }
  };
  
  const handleSelectPreset = (preset: ClothTypePreset) => {
    if (!activeRecord) return;

    // Find the most recently used session across all records to copy its custom categories.
    const findLastSessionEver = () => {
        if (!allRecords || allRecords.length === 0) return null;
        for (const record of allRecords) {
            if (record.sessions.length > 0) {
                return record.sessions[record.sessions.length - 1];
            }
        }
        return null;
    };
    const lastSessionEver = findLastSessionEver();
    
    const newSession: ClothSession = {
      id: new Date().toISOString(),
      clothType: preset.name,
      entries: [],
      customCategories: lastSessionEver ? lastSessionEver.customCategories : [],
      rate: preset.rate,
    };
    const updatedRecord = { ...activeRecord, sessions: [...activeRecord.sessions, newSession] };
    updateActiveRecord(updatedRecord);
    setActiveSessionId(newSession.id);
    setIsSelectModalOpen(false);
  };

  const handleDateChange = (newDate: string) => {
    if (activeRecord && activeRecord.date !== newDate) {
      onChangeDate(newDate);
    }
    setIsCalendarOpen(false);
  };

  const handleDayChange = useCallback((days: number) => {
    if (!activeRecord) return;
    const parts = activeRecord.date.split('-').map(Number);
    const currentDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    currentDate.setUTCDate(currentDate.getUTCDate() + days);
    const newDateStr = currentDate.toISOString().split('T')[0];
    onChangeDate(newDateStr);
  }, [activeRecord, onChangeDate]);

  const handlePreviousDay = () => handleDayChange(-1);
  const handleNextDay = () => handleDayChange(1);

  if (!activeRecord || !activeUser) {
    return <div className="p-4 text-center text-[var(--secondary-text)]">Initializing workday...</div>;
  }

  const defaultCategories = getDefaultCategories(strings);
  const sessionCategories = activeSession ? [...defaultCategories, ...activeSession.customCategories] : defaultCategories;
  
  const formattedDate = new Date(activeRecord.date).toLocaleDateString(undefined, {
    timeZone: 'UTC', // Dates are YYYY-MM-DD, treat as UTC to prevent timezone shifts
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  
  const hasPresets = activeUser.clothTypePresets && activeUser.clothTypePresets.length > 0;

  return (
    <div className="flex flex-col h-full relative">
      <div id="fab-transition-clone" ref={fabCloneRef} style={{ display: 'none' }} />
      <header className="p-4 flex-shrink-0 flex items-center justify-between gap-2">
        {/* User Switcher Button */}
        <div className="flex-shrink-0">
            <button
                onClick={() => setIsUserModalOpen(true)}
                className="flex items-center gap-2 h-10 pl-2 pr-4 rounded-full hover:bg-[var(--accent-subtle)] transition-colors text-[var(--secondary-text)] hover:text-[var(--accent)]"
                title="Switch User"
            >
                <UserIcon />
                <span className="font-bold text-sm truncate max-w-[100px] text-[var(--primary-text)]">{activeUser?.name || '...'}</span>
            </button>
        </div>

        {/* Date Navigator */}
        <div className="flex-shrink-0 flex items-center">
            <button
                onClick={handlePreviousDay}
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[var(--accent-subtle)] text-[var(--secondary-text)] transition-colors"
                title="Previous Day"
            >
                <ChevronLeftIcon className="w-5 h-5" />
            </button>
             <button
                onClick={() => setIsCalendarOpen(true)}
                className="h-10 px-4 rounded-full hover:bg-[var(--accent-subtle)] transition-colors text-sm font-bold text-[var(--primary-text)] flex items-center gap-2"
                title={`Change date: ${formattedDate}`}
            >
                <CalendarIcon />
                <span>{new Date(activeRecord.date).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric'})}</span>
            </button>
            <button
                onClick={handleNextDay}
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-[var(--accent-subtle)] text-[var(--secondary-text)] transition-colors"
                title="Next Day"
            >
                <ChevronRightIcon className="w-5 h-5" />
            </button>
        </div>
      </header>

      {activeRecord.sessions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-[var(--surface)] rounded-full mx-auto flex items-center justify-center text-[var(--tertiary-text)] mb-6">
                <TrackerIcon />
            </div>
            <h2 className="text-xl font-bold mb-2">{hasPresets ? strings.startFirstSession : strings.createFirstPreset}</h2>
            <p className="text-[var(--secondary-text)] mb-6 max-w-xs">{hasPresets ? 'Select a cloth type from your presets to begin tracking your work for the day.' : strings.noPresetsWelcome}</p>
            <button
                onClick={hasPresets ? () => setIsSelectModalOpen(true) : onRequestManagePresets}
                className="py-3 px-6 text-base font-bold rounded-full flex-shrink-0 transition-colors bg-[var(--accent)] text-white flex items-center gap-2 shadow-lg hover:bg-[var(--accent-dark)] active:scale-95"
            >
                {hasPresets ? <PlusIcon className="w-5 h-5" /> : <ListBulletIcon className="w-5 h-5" />}
                <span>{hasPresets ? strings.selectClothType : strings.manageClothTypes}</span>
            </button>
        </div>
      ) : activeSession ? (
        <>
          <div className="flex-1 px-4 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-[var(--secondary-text)] mb-2 px-1">{strings.clothTypeSelection}</h3>
              <div className="flex items-center gap-2 overflow-x-auto category-scrollbar pb-2">
                {activeRecord.sessions.map(session => {
                  const isActive = session.id === activeSessionId;
                  return (
                    <button
                      key={session.id}
                      onClick={() => setActiveSessionId(session.id)}
                      className={`py-2 px-4 text-sm font-bold rounded-full flex-shrink-0 transition-colors whitespace-nowrap flex items-center gap-2 ${isActive ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] hover:bg-[var(--accent-subtle)]'}`}
                    >
                      <span>{session.clothType}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => setIsSelectModalOpen(true)}
                  className="py-2 px-4 text-sm font-bold rounded-full flex-shrink-0 transition-colors bg-[var(--surface)] hover:bg-[var(--accent-subtle)] flex items-center gap-1 whitespace-nowrap"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>{strings.addSession}</span>
                </button>
              </div>
            </div>
            <Summary entries={activeSession.entries} strings={strings} />
            <div className="mt-6">
              <EntriesList entries={activeSession.entries} onDeleteEntry={handleDeleteEntry} strings={strings} />
            </div>
          </div>
          
          <div className="p-4 mt-auto">
            <button
                ref={fabRef}
                onClick={handleOpenNumpadWithAnimation}
                className="w-16 h-16 bg-[var(--accent)] text-white rounded-full shadow-lg flex items-center justify-center ml-auto transform transition-transform active:scale-95 fab-pulse-animation"
                style={{ 
                    opacity: isNumpadOpen ? 0 : 1,
                    transform: isNumpadOpen ? 'scale(0.5)' : 'scale(1)',
                    pointerEvents: isNumpadOpen ? 'none' : 'auto',
                    transition: 'opacity 0.2s, transform 0.2s'
                }}
            >
                <PlusIcon />
            </button>
          </div>
        </>
       ) : (
        <div className="flex-1 flex items-center justify-center text-center text-[var(--secondary-text)]">
          Loading cloth type...
        </div>
      )}

      <div 
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity ${isNumpadOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => handleCloseNumpadWithAnimation()}
      />
      <div 
        ref={numpadSheetRef}
        className={`fixed bottom-0 left-0 right-0 z-40 numpad-bottom-sheet rounded-t-3xl ${isNumpadOpen ? 'open' : ''}`}
      >
        <div 
          className="w-full h-8 flex justify-center items-start pt-3 cursor-grab touch-none"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
            <div className="w-10 h-1 bg-[var(--border)] rounded-full"/>
        </div>
        <Numpad 
            onAdd={(entry) => handleCloseNumpadWithAnimation(entry)}
            categories={sessionCategories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            onManageCategories={() => setShowManageCategories(true)}
            numpadAddButtonRef={numpadAddButtonRef}
            isTransitioning={isFabTransitioning}
            strings={strings}
        />
      </div>

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onDateSelect={handleDateChange}
        currentDate={activeRecord.date}
        records={allRecords}
      />

      {showManageCategories && activeSession && <ManageCategoriesModal 
        customCategories={activeSession.customCategories}
        allSessionCategories={sessionCategories}
        onAdd={handleAddCustomCategory}
        onDelete={handleDeleteCustomCategory}
        onClose={() => setShowManageCategories(false)} 
        strings={strings}
      />}
      
      {isUserModalOpen && <UserManagementModal
        users={users}
        activeUserId={activeUser?.id || null}
        onClose={() => setIsUserModalOpen(false)}
        onSwitchUser={(id) => {
            onSwitchUser(id);
            setIsUserModalOpen(false);
        }}
        onAddUser={onAddUser}
        onRenameUser={onRenameUser}
      />}

      {isSelectModalOpen && (
        <SelectClothTypeModal
            presets={activeUser?.clothTypePresets || []}
            onClose={() => setIsSelectModalOpen(false)}
            onSelect={handleSelectPreset}
            strings={strings}
        />
      )}

    </div>
  );
};

export default TrackerScreen;
