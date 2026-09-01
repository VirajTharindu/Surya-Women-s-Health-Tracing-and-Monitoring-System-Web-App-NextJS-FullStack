import { registerSchema, vitalLogSchema } from '../../src/lib/validations';

describe('Validation Schemas', () => {
    describe('registerSchema', () => {
        it('should validate correct registration data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123',
                name: 'Jane Doe',
                dob: '1990-01-01',
                heightCm: 165
            };
            const result = registerSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail on invalid email', () => {
            const invalidData = {
                email: 'not-an-email',
                password: 'password123',
                name: 'Jane Doe',
                dob: '1990-01-01'
            };
            const result = registerSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid email address');
            }
        });
    });

    describe('vitalLogSchema', () => {
        it('should validate correct BP vital data', () => {
            const validData = {
                vitalType: 'bp',
                value: { systolic: 120, diastolic: 80 },
                classification: 'Normal',
                classificationColor: 'success'
            };
            const result = vitalLogSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail on missing or invalid value fields', () => {
            const invalidData = {
                vitalType: 'bp',
                value: { systolic: 120 }, // Missing diastolic
                classification: 'Normal',
                classificationColor: 'success'
            };
            const result = vitalLogSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});
