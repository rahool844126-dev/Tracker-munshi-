import React from 'react';
import { Language } from '../types';
import { getStrings } from '../constants';
import { CheckIcon } from './Icons';

type Strings = ReturnType<typeof getStrings>;

interface LanguageSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (lang: Language) => void;
    currentLanguage: Language;
    strings: Strings;
}

const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({ isOpen, onClose, onSelect, currentLanguage, strings }) => {
    if (!isOpen) return null;

    const languages: { code: Language; name: string }[] = [
        { code: 'en', name: strings.english },
        { code: 'hi', name: strings.hinglish },
        { code: 'hn', name: strings.hindi },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="modal-content-pane p-6 rounded-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{strings.selectLanguageTitle}</h3>
                <ul className="space-y-2">
                    {languages.map(({ code, name }) => {
                        const isSelected = currentLanguage === code;
                        return (
                            <li key={code}>
                                <button
                                    onClick={() => {
                                        onSelect(code);
                                        onClose();
                                    }}
                                    className={`w-full flex items-center justify-between text-left p-3 rounded-lg transition-colors ${isSelected ? 'bg-[var(--accent-subtle)]' : 'hover:bg-[var(--bg)]'}`}
                                >
                                    <span className={`font-semibold ${isSelected ? 'text-[var(--accent)]' : ''}`}>{name}</span>
                                    {isSelected && <CheckIcon className="w-5 h-5 text-[var(--accent)]" />}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default LanguageSelectionModal;