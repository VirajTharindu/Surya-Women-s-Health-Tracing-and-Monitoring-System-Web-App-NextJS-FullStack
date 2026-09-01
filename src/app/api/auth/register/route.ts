import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input with Zod
        const validationResult = registerSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { email, password, name, dob, heightCm, location } = validationResult.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'An account with this email already exists.' },
                { status: 409 }
            );
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create the user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                dob: new Date(dob),
                heightCm,
                location,
            },
        });

        // Initialize a default PinkBook record for the new user
        await prisma.pinkBook.create({
            data: {
                userId: user.id,
                ancVisits: Array.from({ length: 8 }, (_, i) => ({
                    visitNumber: i + 1,
                    completed: false,
                })),
                vaccinations: [
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
                ],
                growthRecords: [],
            },
        });

        return NextResponse.json(
            { message: 'Registration successful', userId: user.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred during registration.' },
            { status: 500 }
        );
    }
}
