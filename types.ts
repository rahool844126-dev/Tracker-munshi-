import { getStrings } from './constants';

export interface Entry {
  id: string;
  timestamp: string;
  counts: { [key: string]: number };
}

export interface ClothSession {
  id: string;
  clothType: string;
  entries: Entry[];
  customCategories: string[];
  rate?: number;
  deletedAt?: string; // ISO timestamp
}

export interface DailyRecord {
  id: string; // Unique identifier for the work day record
  date: string; // YYY-MM-DD
  sessions: ClothSession[];
}

export interface ClothTypePreset {
  id: string;
  name: string;
  rate?: number;
}

export interface User {
  id: string;
  name: string;
  clothTypePresets: ClothTypePreset[];
  dailyRecords: DailyRecord[];
  activeRecordId: string | null;
  earningsGoal?: number;
  earningsStart?: string; // YYYY-MM-DD or ISO Timestamp
  language: Language;
}

export interface SessionToDelete {
  recordId: string;
  sessionId: string;
}


export type Language = 'en' | 'hi' | 'hn';

export type View = 'tracker' | 'log' | 'insights';
