import React, { useState } from 'react';
import { Language } from '../types';
import { APP_STRINGS, getStrings } from '../constants';
import { TrackerIcon } from './Icons';

type Step = 'welcome' | 'name' | 'language';
type Strings = ReturnType<typeof getStrings>;

interface SetupScreenProps {
    onSetupComplete: (name: string, language: Language) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onSetupComplete }) => {
    const [step, setStep] = useState<Step>('welcome');
    const [userName, setUserName] = useState('');
    
    // Use English strings for the setup process until a language is chosen
    const STRINGS = APP_STRINGS.en;

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userName.trim()) {
            setStep('language');
        }
    };

    const handleLanguageSelect = (lang: Language) => {
        onSetupComplete(userName.trim(), lang);
    };

    const renderStep = () => {
        switch (step) {
            case 'welcome':
                return (
                    <div className="text-center setup-step">
                        <div className="w-24 h-24 bg-[var(--surface)] rounded-full mx-auto flex items-center justify-center text-[var(--tertiary-text)] mb-8">
                            <TrackerIcon />
                        </div>
                        <h1 className="text-3xl font-bold mb-4">{STRINGS.setup.welcomeTitle}</h1>
                        <p className="text-[var(--secondary-text)] mb-10 max-w-sm mx-auto">{STRINGS.setup.welcomeMessage}</p>
                        <button
                            onClick={() => setStep('name')}
                            className="w-full py-4 text-lg font-bold rounded-xl transition-colors bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] active:scale-95"
                        >
                            {STRINGS.setup.getStarted}
                        </button>
                    </div>
                );
            case 'name':
                return (
                    <div className="w-full setup-step">
                        <form onSubmit={handleNameSubmit} className="text-center">
                            <h1 className="text-2xl font-bold mb-4">{STRINGS.setup.nameTitle}</h1>
                            <p className="text-[var(--secondary-text)] mb-8">{STRINGS.setup.namePrompt}</p>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full p-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-xl text-2xl font-bold text-center mb-10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                placeholder={STRINGS.setup.namePlaceholder}
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!userName.trim()}
                                className="w-full py-4 text-lg font-bold rounded-xl transition-all bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] active:scale-95 disabled:opacity-50 disabled:scale-100"
                            >
                                {STRINGS.setup.continue}
                            </button>
                        </form>
                    </div>
                );
            case 'language':
                return (
                    <div className="w-full text-center setup-step">
                        <h1 className="text-2xl font-bold mb-4">{STRINGS.setup.languageTitle}</h1>
                        <p className="text-[var(--secondary-text)] mb-8">{STRINGS.setup.languagePrompt}</p>
                        <div className="space-y-4">
                            <button
                                onClick={() => handleLanguageSelect('en')}
                                className="w-full py-4 text-lg font-bold rounded-xl transition-colors bg-[var(--surface)] border-2 border-[var(--border)] hover:border-[var(--accent)]"
                            >
                                {APP_STRINGS.en.english}
                            </button>
                            <button
                                onClick={() => handleLanguageSelect('hi')}
                                className="w-full py-4 text-lg font-bold rounded-xl transition-colors bg-[var(--surface)] border-2 border-[var(--border)] hover:border-[var(--accent)]"
                            >
                                {APP_STRINGS.en.hinglish}
                            </button>
                            <button
                                onClick={() => handleLanguageSelect('hn')}
                                className="w-full py-4 text-lg font-bold rounded-xl transition-colors bg-[var(--surface)] border-2 border-[var(--border)] hover:border-[var(--accent)]"
                            >
                                {APP_STRINGS.en.hindi}
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="bg-[var(--bg)] h-[100dvh] text-[var(--primary-text)] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md">
                {renderStep()}
            </div>
        </div>
    );
};

export default SetupScreen;