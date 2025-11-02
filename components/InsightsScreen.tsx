import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, DailyRecord } from '../types';
import { getStrings, APP_STRINGS } from '../constants';
import { MunshiJiIcon, UserIcon } from './Icons';

type Strings = ReturnType<typeof getStrings>;

interface Message {
    role: 'user' | 'model';
    content: string;
}

interface StoredChat {
    timestamp: number;
    messages: Message[];
}

// Helper to simplify data for the prompt
const prepareDataForGemini = (user: User, records: DailyRecord[]): string => {
    const simplifiedRecords = records.slice(0, 30).map(record => ({ // Only send last 30 days
        date: record.date,
        sessions: record.sessions.map(session => ({
            clothType: session.clothType,
            rate: session.rate,
            totalPieces: session.entries.reduce((sum, entry) => sum + Object.values(entry.counts).reduce((c, v) => c + v, 0), 0),
            categoryCounts: session.entries.reduce((acc, entry) => {
                Object.entries(entry.counts).forEach(([cat, count]) => {
                    acc[cat] = (acc[cat] || 0) + count;
                });
                return acc;
            }, {} as {[key: string]: number}),
        }))
    }));

    const dataContext = {
        userName: user.name,
        earningsGoal: user.earningsGoal,
        records: simplifiedRecords,
    };

    return JSON.stringify(dataContext, null, 2);
};


interface InsightsScreenProps {
    activeUser: User;
    visibleRecords: DailyRecord[];
    strings: Strings;
}

const InsightsScreen: React.FC<InsightsScreenProps> = ({ activeUser, visibleRecords, strings }) => {
    const storageKey = `insightsChatHistory_${activeUser.id}`;
    
    const [messages, setMessages] = useState<Message[]>(() => {
        try {
            const storedChatRaw = localStorage.getItem(storageKey);
            if (storedChatRaw) {
                const storedChat: StoredChat = JSON.parse(storedChatRaw);
                const oneHour = 60 * 60 * 1000;
                if (Date.now() - storedChat.timestamp < oneHour) {
                    return storedChat.messages;
                }
                // If expired, remove it
                localStorage.removeItem(storageKey);
            }
        } catch (e) {
            console.error("Failed to load chat history from storage:", e);
            localStorage.removeItem(storageKey);
        }
        return [];
    });
    
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const wasOffline = useRef(!navigator.onLine);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline.current) {
                setIsReconnecting(true);
                setTimeout(() => {
                    setIsReconnecting(false);
                }, 2000); // Show for 2 seconds
            }
            wasOffline.current = false;
        };
        const handleOffline = () => {
            setIsOnline(false);
            wasOffline.current = true;
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);


    useEffect(() => {
        // Persist messages to local storage
        if (messages.length > 0) {
            const chatToStore: StoredChat = {
                timestamp: Date.now(),
                messages: messages,
            };
            localStorage.setItem(storageKey, JSON.stringify(chatToStore));
        } else {
            // Clear storage if chat is empty
            localStorage.removeItem(storageKey);
        }
    }, [messages, storageKey]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isLoading, isReconnecting]);

    const handleSendMessage = async (prompt: string) => {
        if (!prompt.trim() || isLoading || !isOnline) return;

        const newUserMessage: Message = { role: 'user', content: prompt };
        setMessages(prev => [...prev, newUserMessage]);
        setInputText('');
        setIsLoading(true);
        setError(null);
        
        try {
            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const userData = prepareDataForGemini(activeUser, visibleRecords);
            
            const fullPrompt = `
                You are a wise, experienced, and friendly Munshi Ji from India. Your name is Munshi Ji.
                Your job is to check the hisaab-kitaab (accounts) of a garment factory worker and answer their questions.
                ALWAYS respond in a respectful but friendly Hinglish tone (Hindi written in English letters). Address the user by their name followed by "ji" (e.g., if the user's name is Rahul, address them as "Rahul ji"). Avoid overly familiar terms like "Beta". You can use encouraging words like "Shabash" (well done).
                When presenting data, you can say things like "Hisaab-kitaab ke anusaar..." (According to the accounts...) or "Maine check kiya hai..." (I have checked...).
                
                Focus on what matters to the worker:
                - How much they earned (kamai).
                - If they are close to their earnings goal (lakshya).
                - Which days they worked the most (sabse zyada kaam) or earned the most.
                - Which cloth type is most profitable (sabse zyada faydemand).

                Do NOT focus on defects like Rework, Oil, etc., unless the user specifically asks. Keep it positive.
                All money is in Indian Rupees (₹). Keep answers short and easy to understand.
                Format your response as plain text or simple markdown (like using * for bold). Do not output JSON.

                Here is the worker's data (hisaab-kitaab):
                ${userData}

                Here is the worker's question:
                "${prompt}"
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
            });

            const modelResponse: Message = { role: 'model', content: response.text };
            setMessages(prev => [...prev, modelResponse]);

        } catch (err) {
            console.error("Gemini API Error:", err);
            setError(strings.munshi.error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(inputText);
    };

    const allSuggestedPrompts = useMemo(() => {
        const hinglishStrings = APP_STRINGS.hi.munshi;
        return [
            hinglishStrings.suggestionWeeklySummary,
            hinglishStrings.suggestionMostProfitable,
            hinglishStrings.suggestionBestDay,
            hinglishStrings.suggestionGoalProgress,
            hinglishStrings.suggestionMostPieces,
            hinglishStrings.suggestionMonthlyEarning,
        ].filter(p => p);
    }, []);

    const suggestedPrompts = useMemo(() => {
        // This ensures new prompts appear if the component re-renders but messages are empty
        return allSuggestedPrompts.sort(() => 0.5 - Math.random()).slice(0, 3);
    }, [allSuggestedPrompts]);
    
    const renderContent = () => {
        if (!isOnline) {
            return (
                <div className="h-full flex flex-col items-center justify-center text-center text-[var(--secondary-text)] p-4">
                    <div className="w-20 h-20 bg-[var(--surface)] rounded-full mx-auto flex items-center justify-center text-[var(--accent)] mb-4 opacity-50">
                        <MunshiJiIcon />
                    </div>
                    <p className="font-bold text-lg text-[var(--primary-text)]">Munshi Ji abhi Chhutti par hai.</p>
                    <p className="max-w-xs mx-auto mt-1">Kripya Internet On karke Unko Wapas Bulaye.</p>
                </div>
            );
        }

        if (isReconnecting) {
            return (
                <div className="h-full flex flex-col items-center justify-center text-center text-[var(--secondary-text)] p-4">
                    <div className="w-20 h-20 bg-[var(--surface)] rounded-full mx-auto flex items-center justify-center text-[var(--accent)] mb-4">
                        <MunshiJiIcon />
                    </div>
                    <p className="font-bold text-lg text-[var(--primary-text)] animate-pulse">Munshi Ji aa rahe hai...</p>
                </div>
            );
        }

        return (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !isLoading && (
                    <div className="text-center text-[var(--secondary-text)] pt-8">
                        <div className="w-20 h-20 bg-[var(--surface)] rounded-full mx-auto flex items-center justify-center text-[var(--accent)] mb-4">
                            <MunshiJiIcon />
                        </div>
                        <p className="max-w-xs mx-auto">{strings.munshi.description}</p>
                        <div className="mt-6 flex flex-col items-center gap-2">
                            {suggestedPrompts.map(prompt => (
                                <button
                                    key={prompt}
                                    onClick={() => handleSendMessage(prompt)}
                                    className="text-sm font-semibold py-2 px-4 bg-[var(--surface)] rounded-full hover:bg-[var(--accent-subtle)] transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                                <MunshiJiIcon />
                            </div>
                        )}
                        <div 
                            className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[var(--accent)] text-white rounded-br-lg' : 'bg-[var(--surface)] rounded-bl-lg'}`}
                            style={{ overflowWrap: 'break-word' }}
                        >
                            {msg.content}
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-[var(--surface)] text-[var(--secondary-text)] flex items-center justify-center flex-shrink-0">
                                <UserIcon />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                            <MunshiJiIcon />
                        </div>
                        <div className="p-3 rounded-2xl bg-[var(--surface)] rounded-bl-lg flex items-center">
                            <span className="w-2 h-2 bg-[var(--secondary-text)] rounded-full animate-pulse " style={{animationDelay: '0s'}}/>
                            <span className="w-2 h-2 bg-[var(--secondary-text)] rounded-full animate-pulse ml-1.5" style={{animationDelay: '0.2s'}}/>
                            <span className="w-2 h-2 bg-[var(--secondary-text)] rounded-full animate-pulse ml-1.5" style={{animationDelay: '0.4s'}}/>
                        </div>
                    </div>
                )}
                {error && <p className="text-center text-red-500">{error}</p>}
                <div ref={messagesEndRef} />
            </div>
        );
    };


    return (
        <div className="h-full flex flex-col bg-[var(--bg)]">
            <header className="p-4 flex-shrink-0 flex items-center justify-between border-b border-[var(--border)]">
                <h1 className="text-2xl font-bold">{strings.munshi.title}</h1>
            </header>

            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>

            <div className="p-4 bg-[var(--bg)] border-t border-[var(--border)]">
                {isOnline && !isReconnecting && (
                    <form onSubmit={handleFormSubmit} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={strings.munshi.placeholder}
                            className="flex-1 p-3 bg-[var(--surface)] border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputText.trim()}
                            className="w-12 h-12 bg-[var(--accent)] text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default InsightsScreen;