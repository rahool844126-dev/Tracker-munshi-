import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Entry } from '../types';
import { getStrings, getCategoryStyles } from '../constants';
import { TrashIcon } from './Icons';

type Strings = ReturnType<typeof getStrings>;

interface EntryListItemProps {
    entry: Entry;
    onDeleteEntry: (id: string) => void;
    isOpen: boolean;
    onToggle: (id: string | null) => void;
    isFirst: boolean;
    isDeleting: boolean;
    strings: Strings;
}

const EntryListItem: React.FC<EntryListItemProps> = ({ entry, onDeleteEntry, isOpen, onToggle, isFirst, isDeleting, strings }) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const currentTranslateX = useRef(0);
    const animationFrameId = useRef<number | null>(null);
    const liRef = useRef<HTMLLIElement>(null);

    const deleteButtonWidth = 80; // in pixels

    const getClientX = (e: React.MouseEvent | React.TouchEvent) => 'touches' in e ? e.touches[0].clientX : e.clientX;

    const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isOpen) {
            onToggle(null);
        }
        isDragging.current = true;
        startX.current = getClientX(e);
        if (itemRef.current) {
            itemRef.current.style.transition = 'none';
        }
        animationFrameId.current = null;
    }, [isOpen, onToggle]);

    const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging.current || !itemRef.current) return;

        const currentX = getClientX(e);
        let deltaX = currentX - startX.current;

        if (isOpen) {
            deltaX -= deleteButtonWidth;
        }

        const newTranslateX = Math.max(-deleteButtonWidth, Math.min(0, deltaX));
        currentTranslateX.current = newTranslateX;

        if (!animationFrameId.current) {
            animationFrameId.current = requestAnimationFrame(() => {
                if (itemRef.current) {
                    itemRef.current.style.transform = `translateX(${currentTranslateX.current}px)`;
                }
                animationFrameId.current = null;
            });
        }
    }, [isOpen]);

    const handleDragEnd = useCallback(() => {
        if (!isDragging.current || !itemRef.current) return;
        isDragging.current = false;
        itemRef.current.style.transition = 'transform 0.3s ease';

        const threshold = -deleteButtonWidth / 2;
        if (currentTranslateX.current < threshold) {
            onToggle(entry.id);
        } else {
            onToggle(null);
        }
    }, [entry.id, onToggle]);

    useEffect(() => {
        if (itemRef.current) {
            if (isOpen) {
                itemRef.current.style.transform = `translateX(-${deleteButtonWidth}px)`;
            } else {
                itemRef.current.style.transform = 'translateX(0px)';
            }
        }
    }, [isOpen]);

    // Set initial max-height for exit animation
    useEffect(() => {
        if (liRef.current) {
            liRef.current.style.maxHeight = `${liRef.current.scrollHeight}px`;
        }
    }, []);

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <li
          ref={liRef}
          className={`bg-[var(--surface-raised)] rounded-xl relative overflow-hidden transition-all duration-300 ease-out ${isDeleting ? 'list-item-exit' : ''}`}
          style={{ touchAction: 'pan-y' }}
        >
            <div className="absolute top-0 right-0 h-full w-20 flex">
                <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="bg-red-500 text-white w-full h-full flex flex-col items-center justify-center font-semibold text-xs transition-colors hover:bg-red-600"
                    aria-label={`Delete entry at ${formatTime(entry.timestamp)}`}
                >
                    <TrashIcon className="h-6 w-6" />
                    <span className="mt-1">{strings.deleteEntry}</span>
                </button>
            </div>
            <div
                ref={itemRef}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                onMouseMove={handleDragMove}
                onTouchMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onTouchEnd={handleDragEnd}
                onMouseLeave={handleDragEnd}
                className={`relative bg-[var(--surface)] p-3 flex justify-between items-center cursor-grab active:cursor-grabbing ${isFirst ? 'new-entry-animation' : ''}`}
                style={{ transition: 'transform 0.3s ease' }}
            >
                <div className="flex items-center gap-4 text-sm">
                    <span className="font-mono text-[var(--tertiary-text)] text-xs">{formatTime(entry.timestamp)}</span>
                    <div className="flex gap-x-4 flex-wrap font-medium">
                        {Object.entries(entry.counts).map(([key, value]) => {
                            const style = getCategoryStyles(strings)[key];
                            return (
                                <span key={key} style={{ color: style ? style.color : 'inherit' }}>
                                    <span className="text-[var(--secondary-text)]">{key}:</span> <strong>{value}</strong>
                                </span>
                            );
                        })}
                    </div>
                </div>
                {/* Visual affordance for swiping */}
                <div className="flex-shrink-0 text-[var(--tertiary-text)]">
                    <div className="w-1 h-4 bg-[var(--border)] rounded-full"></div>
                </div>
            </div>
        </li>
    );
};

interface EntriesListProps {
    entries: Entry[];
    onDeleteEntry: (id: string) => void;
    strings: Strings;
}

const EntriesList: React.FC<EntriesListProps> = ({ entries, onDeleteEntry, strings }) => {
    const [openEntryId, setOpenEntryId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    
    const handleDelete = (id: string) => {
        setDeletingId(id);
        setTimeout(() => {
            onDeleteEntry(id);
            setDeletingId(null);
        }, 300); // match animation duration
    };

    if (entries.length === 0) {
        return (
            <div className="text-center text-[var(--secondary-text)] py-10">
                <div className="w-16 h-16 bg-[var(--surface)] rounded-full mx-auto flex items-center justify-center text-[var(--tertiary-text)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                </div>
                <p className="mt-4 font-medium">{strings.noEntries}</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-sm font-bold text-[var(--secondary-text)] mb-3 px-1">{strings.recentEntries}</h3>
            <ul className="space-y-3">
                {entries.slice(0, 10).map((entry, index) => (
                    <EntryListItem
                        key={entry.id}
                        entry={entry}
                        onDeleteEntry={handleDelete}
                        isOpen={openEntryId === entry.id}
                        onToggle={(id) => setOpenEntryId(id)}
                        isFirst={index === 0 && !deletingId}
                        isDeleting={deletingId === entry.id}
                        strings={strings}
                    />
                ))}
            </ul>
        </div>
    );
};

export default EntriesList;