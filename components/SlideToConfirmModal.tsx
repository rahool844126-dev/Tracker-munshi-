import React, { useRef, useState, useEffect, useCallback } from 'react';
import { getStrings } from '../constants';
import { ChevronDoubleRightIcon } from './Icons';

type Strings = ReturnType<typeof getStrings>;

interface SlideToConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    strings: Strings;
}

const SlideToConfirmModal: React.FC<SlideToConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, strings }) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const interactionState = useRef({
        isDragging: false,
        startX: 0,
        maxTranslateX: 0,
    });
    
    const [thumbTranslateX, setThumbTranslateX] = useState(0);
    const thumbTranslateXRef = useRef(0);
    
    useEffect(() => {
        thumbTranslateXRef.current = thumbTranslateX;
    });

    const resetSlider = useCallback(() => {
        if (thumbRef.current) {
            thumbRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
            setThumbTranslateX(0);
        }
    }, []);

    useEffect(() => {
        if (isOpen && trackRef.current && thumbRef.current) {
            const trackWidth = trackRef.current.offsetWidth;
            const thumbWidth = thumbRef.current.offsetWidth;
            interactionState.current.maxTranslateX = trackWidth - thumbWidth - 4; // 2px padding on each side
        } else if (!isOpen) {
            // Reset slider state when modal is closed
            resetSlider();
        }
    }, [isOpen, resetSlider]);


    const handleInteractionStart = useCallback((clientX: number) => {
        if (thumbRef.current) {
            thumbRef.current.style.transition = 'none';
        }
        interactionState.current.isDragging = true;
        interactionState.current.startX = clientX - thumbTranslateXRef.current;
    }, []);

    const handleInteractionMove = useCallback((clientX: number) => {
        if (!interactionState.current.isDragging) return;

        const { startX, maxTranslateX } = interactionState.current;
        const newTranslateX = clientX - startX;
        const constrainedX = Math.max(0, Math.min(newTranslateX, maxTranslateX));
        
        setThumbTranslateX(constrainedX);
    }, []);

    const handleInteractionEnd = useCallback(() => {
        if (!interactionState.current.isDragging) return;
        interactionState.current.isDragging = false;
        
        const { maxTranslateX } = interactionState.current;
        const threshold = maxTranslateX * 0.98;

        if (thumbTranslateXRef.current >= threshold) {
            onConfirm();
        } else {
            resetSlider();
        }
    }, [onConfirm, resetSlider]);
    
    useEffect(() => {
        if (!isOpen) return;

        const handleMouseMove = (e: MouseEvent) => handleInteractionMove(e.clientX);
        const handleTouchMove = (e: TouchEvent) => {
            if (interactionState.current.isDragging) {
                e.preventDefault(); // Prevent page scroll
                handleInteractionMove(e.touches[0].clientX);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleInteractionEnd);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleInteractionEnd);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleInteractionEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleInteractionEnd);
        };
    }, [isOpen, handleInteractionMove, handleInteractionEnd]);


    if (!isOpen) return null;

    const progressPercentage = (thumbTranslateX / (interactionState.current.maxTranslateX || 1)) * 100;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="modal-content-pane p-6 rounded-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-sm text-[var(--secondary-text)] mb-6">{message}</p>
                
                <div ref={trackRef} className="slide-to-confirm-track">
                    <div
                        ref={progressRef}
                        className="slide-to-confirm-progress"
                        style={{ width: `${thumbTranslateX + 24}px`, transition: interactionState.current.isDragging ? 'none' : 'width 0.3s cubic-bezier(0.25, 1, 0.5, 1)' }}
                    />
                    <div className="slide-to-confirm-text">
                        <span>{strings.slideToConfirm}</span>
                    </div>
                    <div
                        ref={thumbRef}
                        className="slide-to-confirm-thumb"
                        style={{ transform: `translateX(${thumbTranslateX}px)` }}
                        onMouseDown={(e) => handleInteractionStart(e.clientX)}
                        onTouchStart={(e) => handleInteractionStart(e.touches[0].clientX)}
                    >
                        <ChevronDoubleRightIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlideToConfirmModal;