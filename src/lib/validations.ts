import { z } from 'zod';

// ─── Auth Schemas ───────────────────────────────────────────────────

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
    heightCm: z.number().min(50).max(250).optional().default(158),
    location: z.string().optional().default('Colombo, Sri Lanka'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// ─── Cycle Log ──────────────────────────────────────────────────────

export const cycleLogSchema = z.object({
    date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
    flowIntensity: z.enum(['spotting', 'light', 'medium', 'heavy']),
    cramps: z.number().int().min(1).max(5),
    mood: z.enum(['great', 'good', 'neutral', 'low', 'terrible']),
    symptoms: z.array(z.string()),
    note: z.string().optional(),
});

// ─── Vital Log ──────────────────────────────────────────────────────

const bpValueSchema = z.object({
    systolic: z.number().int().min(60).max(300),
    diastolic: z.number().int().min(30).max(200),
});

const glucoseValueSchema = z.object({
    value: z.number().min(20).max(600),
    timing: z.enum(['fasting', 'postmeal', 'random']),
});

const weightValueSchema = z.object({
    kg: z.number().min(20).max(300),
    bmi: z.number().min(5).max(100),
});

export const vitalLogSchema = z.object({
    vitalType: z.enum(['bp', 'glucose', 'weight']),
    value: z.union([bpValueSchema, glucoseValueSchema, weightValueSchema]),
    classification: z.string(),
    classificationColor: z.enum(['success', 'warning', 'error', 'info']),
});

export const vitalLogUpdateSchema = vitalLogSchema.partial();

// ─── Reminder ───────────────────────────────────────────────────────

export const reminderSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    time: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date/time'),
    category: z.enum(['medication', 'appointment', 'vaccination', 'checkup', 'other']),
});

// ─── Reminder Update ───────────────────────────────────────────────────────
export const reminderUpdateSchema = reminderSchema.partial().extend({
    isCompleted: z.boolean().optional(),
});

// ─── User Profile ───────────────────────────────────────────────────

export const userProfileUpdateSchema = z.object({
    name: z.string().min(2).optional(),
    dob: z.string().optional(),
    heightCm: z.number().min(50).max(250).optional(),
    location: z.string().optional(),
    languagePref: z.enum(['en', 'si', 'ta']).optional(),
});

// ─── Pink Book ──────────────────────────────────────────────────────

export const pinkBookUpdateSchema = z.object({
    registrationNumber: z.string().optional(),
    registeredClinic: z.string().optional(),
    edd: z.string().optional(),
    ttDose1: z.boolean().optional(),
    ttDose1Date: z.string().optional(),
    ttDose2: z.boolean().optional(),
    ttDose2Date: z.string().optional(),
    ironAdherence: z.number().int().min(0).max(100).optional(),
    childName: z.string().optional(),
    childDob: z.string().optional(),
    ancVisits: z.any().optional(),
    vaccinations: z.any().optional(),
    growthRecords: z.any().optional(),
});

// ─── Type Exports ───────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CycleLogInput = z.infer<typeof cycleLogSchema>;
export type VitalLogInput = z.infer<typeof vitalLogSchema>;
export type ReminderInput = z.infer<typeof reminderSchema>;
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
export type PinkBookUpdate = z.infer<typeof pinkBookUpdateSchema>;
