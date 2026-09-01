'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, TextField, Typography, Paper, Alert, Grid } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        dob: '',
        heightCm: 158,
        location: 'Colombo, Sri Lanka'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    heightCm: Number(formData.heightCm)
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                if (data.details) {
                    const errorMessages = Object.entries(data.details)
                        .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
                        .join(' | ');
                    setError(errorMessages);
                } else {
                    setError(data.error || 'Registration failed');
                }
            } else {
                router.push('/auth/login');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fdf2f8', p: 2 }}>
            <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500, borderRadius: 3 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <LocalHospitalIcon color="secondary" sx={{ fontSize: 48, mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold" color="secondary">
                        Join Suriya
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Create your health tracker account
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Date of Birth"
                                type="date"
                                required
                                InputLabelProps={{ shrink: true }}
                                value={formData.dob}
                                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Height (cm)"
                                type="number"
                                required
                                value={formData.heightCm}
                                onChange={(e) => setFormData({...formData, heightCm: Number(e.target.value)})}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Location"
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                            />
                        </Grid>
                    </Grid>

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        color="secondary"
                        sx={{ mt: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </Button>
                </form>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2">
                        Already have an account?{' '}
                        <Button color="primary" onClick={() => router.push('/auth/login')}>
                            Sign in
                        </Button>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}
