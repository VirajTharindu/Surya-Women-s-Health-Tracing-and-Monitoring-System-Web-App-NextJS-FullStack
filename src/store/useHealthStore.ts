import { create } from 'zustand';
import { DoublyLinkedList } from '@/lib/data-structures/DoublyLinkedList';
import { PriorityQueue, Prioritizable } from '@/lib/data-structures/PriorityQueue';

// ─── Health Log Types ───────────────────────────────────────────────
export interface CycleLog {
    id: string;
    date: string;
    type: 'cycle';
    note?: string;
    flowIntensity: 'spotting' | 'light' | 'medium' | 'heavy';
    cramps: number; // 1-5
    mood: 'great' | 'good' | 'neutral' | 'low' | 'terrible';
    symptoms: string[]; // e.g. ['fatigue', 'bloating', 'headache']
}

export interface VitalLog {
    id: string;
    date: string;
    type: 'vital';
    vitalType: 'bp' | 'glucose' | 'weight';
    note?: string;
    // BP: { systolic, diastolic }
    // Glucose: { value, timing }
    // Weight: { kg }
    value: any;
    classification?: string; // e.g. 'Normal', 'Elevated', 'Pre-diabetic'
    classificationColor?: 'success' | 'warning' | 'error' | 'info';
}

export type HealthLog = CycleLog | VitalLog | {
    id: string;
    date: string;
    type: 'symptom';
    note?: string;
    value?: any;
};

// ─── Reminder ───────────────────────────────────────────────────────
export type ReminderCategory = 'medication' | 'appointment' | 'vaccination' | 'checkup' | 'other';

export interface Reminder extends Prioritizable {
    id: string;
    title: string;
    description: string;
    time: number; // timestamp
    category: ReminderCategory;
}

// ─── Pink Book ──────────────────────────────────────────────────────
export interface ANCVisit {
    visitNumber: number;
    completed: boolean;
    date?: string;
    notes?: string;
}

export interface VaccinationRecord {
    id: string;
    name: string;
    ageRange: string; // e.g. "At birth", "2 months"
    completed: boolean;
    dateGiven?: string;
}

export interface PinkBookData {
    // Maternal
    registrationNumber: string;
    registeredClinic: string;
    edd: string; // Expected delivery date
    ttDose1: boolean;
    ttDose1Date: string;
    ttDose2: boolean;
    ttDose2Date: string;
    ironAdherence: number; // 0-100 percentage
    ancVisits: ANCVisit[];
    // Child
    childName: string;
    childDob: string;
    vaccinations: VaccinationRecord[];
    growthRecords: { date: string; weightKg: number; heightCm: number }[];
}

// ─── User Profile ───────────────────────────────────────────────────
export interface UserProfile {
    name: string;
    dob: string;
    heightCm: number;
    location: string;
}

// ─── Cycle Settings (computed from history) ─────────────────────────
export interface CycleSettings {
    avgCycleLength: number;
    avgPeriodDuration: number;
}

// ─── Default Pink Book Vaccinations (Sri Lanka NIS) ─────────────────
const defaultVaccinations: VaccinationRecord[] = [
    { id: 'bcg', name: 'BCG', ageRange: 'At birth', completed: false },
    { id: 'opv0', name: 'OPV (Zero dose)', ageRange: 'At birth', completed: false },
    { id: 'penta1', name: 'Pentavalent 1 + OPV 1', ageRange: '2 months', completed: false },
    { id: 'penta2', name: 'Pentavalent 2 + OPV 2', ageRange: '4 months', completed: false },
    { id: 'penta3', name: 'Pentavalent 3 + OPV 3', ageRange: '6 months', completed: false },
    { id: 'measles1', name: 'Measles / MR', ageRange: '9 months', completed: false },
    { id: 'je', name: 'Japanese Encephalitis (JE)', ageRange: '12 months', completed: false },
    { id: 'mmr', name: 'MMR', ageRange: '12 months', completed: false },
    { id: 'dpt_opv_boost', name: 'DPT + OPV Booster', ageRange: '18 months', completed: false },
    { id: 'measles2', name: 'Measles / MR Booster', ageRange: '3 years', completed: false },
    { id: 'dt', name: 'DT (Diphtheria + Tetanus)', ageRange: '5 years', completed: false },
    { id: 'adt', name: 'aDT (Adult Tetanus)', ageRange: '12 years', completed: false },
];

const defaultPinkBookData: PinkBookData = {
    registrationNumber: '',
    registeredClinic: '',
    edd: '',
    ttDose1: false,
    ttDose1Date: '',
    ttDose2: false,
    ttDose2Date: '',
    ironAdherence: 0,
    ancVisits: Array.from({ length: 8 }, (_, i) => ({
        visitNumber: i + 1,
        completed: false,
    })),
    childName: '',
    childDob: '',
    vaccinations: defaultVaccinations,
    growthRecords: [],
};

// ─── Store ──────────────────────────────────────────────────────────
interface HealthState {
    logs: DoublyLinkedList<HealthLog>;
    reminders: PriorityQueue<Reminder>;
    language: 'en' | 'si' | 'ta';
    userProfile: UserProfile;
    pinkBookData: PinkBookData;

    addLog: (log: HealthLog) => void;
    addReminder: (reminder: Reminder) => void;
    removeReminder: () => Reminder | undefined;
    deleteReminderById: (id: string) => void;
    updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
    deleteCycleLog: (id: string) => Promise<void>;
    updateCycleLog: (id: string, updates: Partial<CycleLog>) => Promise<void>;
    updateVitalLog: (id: string, updates: Partial<VitalLog>) => Promise<void>;
    deleteVitalLog: (id: string) => Promise<void>;
    setLanguage: (lang: 'en' | 'si' | 'ta') => void;
    setUserProfile: (profile: Partial<UserProfile>) => void;
    updatePinkBookData: (data: Partial<PinkBookData>) => void;
    toggleVaccination: (vaccinationId: string) => void;
    toggleANCVisit: (visitNumber: number) => void;
    addGrowthRecord: (record: { date: string; weightKg: number; heightCm: number }) => void;
    fetchInitialData: () => Promise<void>;

    getCycleLogs: () => CycleLog[];
    getVitalLogs: (vitalType?: string) => VitalLog[];
    getLogByDate: (dateStr: string) => HealthLog | null;
    getCycleSettings: () => CycleSettings;
    getNextPeriodDate: () => Date | null;
    getCurrentCyclePhase: () => { phase: string; day: number; color: string };
}

export const useHealthStore = create<HealthState>((set, get) => ({
    logs: new DoublyLinkedList<HealthLog>(),
    reminders: new PriorityQueue<Reminder>(),
    language: 'en',
    userProfile: {
        name: 'Suriya User',
        dob: '1995-06-15',
        heightCm: 158,
        location: 'Colombo, Sri Lanka',
    },
    pinkBookData: { ...defaultPinkBookData },

    addLog: async (log) => {
        const { logs } = get();
        // Optimistic update
        const newLogs = logs.clone();
        newLogs.append(log);
        newLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        set({ logs: newLogs });

        // API sync
        try {
            const endpoint = log.type === 'cycle' ? '/api/logs/cycle' : '/api/logs/vitals';
            await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(log),
            });
        } catch (error) {
            console.error('Failed to sync log:', error);
        }
    },

    addReminder: async (reminder) => {
        const { reminders } = get();
        const newReminders = reminders.clone();
        newReminders.push({ ...reminder, priority: reminder.time });
        set({ reminders: newReminders });

        try {
            // API expects time as an ISO string, not a number
            await fetch('/api/reminders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...reminder,
                    time: new Date(reminder.time).toISOString(),
                }),
            });
        } catch (error) {
            console.error('Failed to sync reminder:', error);
        }
    },

    removeReminder: () => {
        const { reminders } = get();
        const newReminders = reminders.clone();
        const removed = newReminders.pop();
        set({ reminders: newReminders });
        return removed;
    },

    deleteReminderById: async (id: string) => {
        const { reminders } = get();
        const items = reminders.toArray().filter(r => r.id !== id);
        const newQueue = new PriorityQueue<Reminder>();
        items.forEach(item => newQueue.push(item));
        set({ reminders: newQueue });

        try {
            // DELETE API uses query param, not request body
            await fetch(`/api/reminders?id=${encodeURIComponent(id)}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Failed to delete reminder:', error);
        }
    },
    // ---- New: Update Reminder ----
    updateReminder: async (id: string, updates: Partial<Reminder>) => {
        const { reminders } = get();
        const items = reminders.toArray().map(r => (r.id === id ? { ...r, ...updates } : r));
        const newQueue = new PriorityQueue<Reminder>();
        items.forEach(item => newQueue.push(item));
        set({ reminders: newQueue });
        try {
            await fetch(`/api/reminders?id=${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updates, ...(updates.time !== undefined ? { time: new Date(updates.time).toISOString() } : {}) }),
            });
        } catch (error) {
            console.error('Failed to update reminder:', error);
        }
    },
    // ---- New: Delete Cycle Log ----
    deleteCycleLog: async (id: string) => {
        const { logs } = get();
        const newLogs = logs.clone();
        // Assuming DoublyLinkedList has a method to remove by id; rebuild without the id
        const filtered = newLogs.toArray().filter(l => l.id !== id);
        const rebuilt = new DoublyLinkedList<HealthLog>();
        filtered.forEach(l => rebuilt.append(l));
        set({ logs: rebuilt });
        try {
            await fetch(`/api/logs/cycle?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete cycle log:', error);
        }
    },
    updateCycleLog: async (id: string, updates: Partial<CycleLog>) => {
        const { logs } = get();
        const newLogs = logs.clone();
        const updatedArray = newLogs.toArray().map(l => (l.id === id ? { ...l, ...updates } as HealthLog : l));
        const rebuilt = new DoublyLinkedList<HealthLog>();
        updatedArray.forEach(l => rebuilt.append(l));
        set({ logs: rebuilt });
        try {
            await fetch(`/api/logs/cycle?id=${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updates, date: updates.date ? new Date(updates.date).toISOString() : undefined }),
            });
        } catch (error) {
            console.error('Failed to update cycle log:', error);
        }
    },
    // ---- New: Delete Vital Log ----
    deleteVitalLog: async (id: string) => {
        const { logs } = get();
        const newLogs = logs.clone();
        const filtered = newLogs.toArray().filter(l => l.id !== id);
        const rebuilt = new DoublyLinkedList<HealthLog>();
        filtered.forEach(l => rebuilt.append(l));
        set({ logs: rebuilt });
        try {
            await fetch(`/api/logs/vitals?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        } catch (error) {
            console.error('Failed to delete vital log:', error);
        }
    },
    // ---- New: Update Vital Log ----
    updateVitalLog: async (id: string, updates: Partial<VitalLog>) => {
        const { logs } = get();
        const newLogs = logs.clone();
        const updatedArray = newLogs.toArray().map(l => (l.id === id ? { ...l, ...updates } as HealthLog : l));
        const rebuilt = new DoublyLinkedList<HealthLog>();
        updatedArray.forEach(l => rebuilt.append(l));
        set({ logs: rebuilt });
        try {
            await fetch(`/api/logs/vitals?id=${encodeURIComponent(id)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updates, date: updates.date ? new Date(updates.date).toISOString() : undefined }),
            });
        } catch (error) {
            console.error('Failed to update vital log:', error);
        }
    },


    setLanguage: (lang) => set({ language: lang }),

    setUserProfile: async (profile) => {
        const { userProfile } = get();
        set({ userProfile: { ...userProfile, ...profile } });

        try {
            await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });
        } catch (error) {
            console.error('Failed to sync profile:', error);
        }
    },

    updatePinkBookData: async (data) => {
        const { pinkBookData } = get();
        set({ pinkBookData: { ...pinkBookData, ...data } });

        try {
            await fetch('/api/pinkbook', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
        } catch (error) {
            console.error('Failed to sync pinkbook:', error);
        }
    },

    toggleVaccination: (vaccinationId: string) => {
        const { pinkBookData, updatePinkBookData } = get();
        const vaccinations = pinkBookData.vaccinations.map(v =>
            v.id === vaccinationId
                ? { ...v, completed: !v.completed, dateGiven: !v.completed ? new Date().toISOString().split('T')[0] : undefined }
                : v
        );
        updatePinkBookData({ vaccinations });
    },

    toggleANCVisit: (visitNumber: number) => {
        const { pinkBookData, updatePinkBookData } = get();
        const ancVisits = pinkBookData.ancVisits.map(v =>
            v.visitNumber === visitNumber
                ? { ...v, completed: !v.completed, date: !v.completed ? new Date().toISOString().split('T')[0] : undefined }
                : v
        );
        updatePinkBookData({ ancVisits });
    },

    addGrowthRecord: (record) => {
        const { pinkBookData, updatePinkBookData } = get();
        updatePinkBookData({
            growthRecords: [...pinkBookData.growthRecords, record],
        });
    },

    fetchInitialData: async () => {
        try {
            // Fetch User Profile
            const profileRes = await fetch('/api/user/profile');
            if (profileRes.ok) {
                const profile = await profileRes.json();
                set({ userProfile: { ...get().userProfile, ...profile } });
            }

            // Fetch Cycle Logs
            const cycleRes = await fetch('/api/logs/cycle');
            if (cycleRes.ok) {
                const cycleLogs = await cycleRes.json();
                let { logs } = get();
                logs = logs.clone();
                cycleLogs.forEach((log: any) => logs.append({ ...log, type: 'cycle' }));
                set({ logs });
            }

            // Fetch Vitals Logs (first page)
            const vitalsRes = await fetch('/api/logs/vitals?page=1&limit=100');
            if (vitalsRes.ok) {
                const vitalsResponse = await vitalsRes.json();
                const vitalsLogs = vitalsResponse.data || [];
                let { logs } = get();
                logs = logs.clone();
                vitalsLogs.forEach((log: any) => logs.append({ ...log, type: 'vital' }));
                set({ logs });
            }
            
            // Sort merged logs
            let { logs: currentLogs } = get();
            currentLogs = currentLogs.clone();
            currentLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            set({ logs: currentLogs });

            // Fetch Reminders
            const remindersRes = await fetch('/api/reminders');
            if (remindersRes.ok) {
                const remindersList = await remindersRes.json();
                const newQueue = new PriorityQueue<Reminder>();
                remindersList.forEach((r: any) => {
                    // DB stores time as ISO string; convert back to timestamp number
                    const timeMs = new Date(r.time).getTime();
                    newQueue.push({ ...r, time: timeMs, priority: timeMs });
                });
                set({ reminders: newQueue });
            }

            // Fetch Pink Book
            const pbRes = await fetch('/api/pinkbook');
            if (pbRes.ok) {
                const pb = await pbRes.json();
                set({ pinkBookData: { ...get().pinkBookData, ...pb } });
            }

        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    },

    // ─── Computed ────────────────────────────────────────────────────
    getCycleLogs: () => {
        const { logs } = get();
        return logs.toArray().filter((log): log is CycleLog => log.type === 'cycle');
    },

    getVitalLogs: (vitalType?: string) => {
        const { logs } = get();
        return logs.toArray().filter(
            (log): log is VitalLog => log.type === 'vital' && (!vitalType || (log as VitalLog).vitalType === vitalType)
        );
    },

    getLogByDate: (dateStr: string) => {
        const { logs } = get();
        const logsArray = logs.toArray();
        // Since logs are kept sorted by date, we can use binary search
        const targetTime = new Date(dateStr).getTime();
        
        // Custom binary search to find a log by date efficiently
        let left = 0;
        let right = logsArray.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const midTime = new Date(logsArray[mid].date).getTime();

            if (midTime === targetTime) return logsArray[mid];
            if (midTime < targetTime) left = mid + 1;
            else right = mid - 1;
        }
        return null;
    },

    getCycleSettings: () => {
        const cycleLogs = get().getCycleLogs();
        if (cycleLogs.length < 2) {
            return { avgCycleLength: 28, avgPeriodDuration: 5 };
        }
        const dates = cycleLogs.map(l => new Date(l.date).getTime()).sort((a, b) => a - b);
        const diffs: number[] = [];
        for (let i = 1; i < dates.length; i++) {
            diffs.push(Math.round((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)));
        }
        const avgCycleLength = Math.round(diffs.reduce((s, d) => s + d, 0) / diffs.length);
        return { avgCycleLength: avgCycleLength || 28, avgPeriodDuration: 5 };
    },

    getNextPeriodDate: () => {
        const cycleLogs = get().getCycleLogs();
        if (cycleLogs.length === 0) return null;
        const lastDate = new Date(cycleLogs[cycleLogs.length - 1].date);
        const { avgCycleLength } = get().getCycleSettings();
        const next = new Date(lastDate);
        next.setDate(next.getDate() + avgCycleLength);
        return next;
    },

    getCurrentCyclePhase: () => {
        const cycleLogs = get().getCycleLogs();
        if (cycleLogs.length === 0) {
            return { phase: 'Unknown', day: 0, color: '#9e9e9e' };
        }
        const lastDate = new Date(cycleLogs[cycleLogs.length - 1].date);
        lastDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysSinceLast = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        const { avgCycleLength, avgPeriodDuration } = get().getCycleSettings();

        if (daysSinceLast < 0) return { phase: 'Unknown', day: 0, color: '#9e9e9e' };
        if (daysSinceLast <= avgPeriodDuration) {
            return { phase: 'Menstrual', day: daysSinceLast + 1, color: '#D81B60' };
        }
        if (daysSinceLast <= 13) {
            return { phase: 'Follicular', day: daysSinceLast + 1, color: '#7B1FA2' };
        }
        if (daysSinceLast <= 16) {
            return { phase: 'Ovulation', day: daysSinceLast + 1, color: '#FF6F00' };
        }
        if (daysSinceLast <= avgCycleLength) {
            return { phase: 'Luteal', day: daysSinceLast + 1, color: '#1565C0' };
        }
        return { phase: 'Late', day: daysSinceLast + 1, color: '#c62828' };
    },
}));
