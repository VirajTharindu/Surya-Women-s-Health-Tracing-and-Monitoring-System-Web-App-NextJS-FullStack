'use client';

import React, { useState, useMemo } from 'react';
import { Box, Typography, Paper, Slider, Chip, Grid } from '@mui/material';
import { greedyAllocate, ClinicDemand } from '@/lib/algorithms/community';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import { useHealthStore } from '@/store/useHealthStore';

const DEMANDS: ClinicDemand[] = [
    { id: 'Colombo Central', demand: 500, priority: 8 },
    { id: 'Jaffna North', demand: 300, priority: 10 },
    { id: 'Kandy Rural', demand: 200, priority: 9 },
    { id: 'Galle Coastal', demand: 400, priority: 5 },
    { id: 'Ratnapura West', demand: 150, priority: 7 },
];

export default function ResourceAllocation() {
    const { language } = useHealthStore();
    const [stock, setStock] = useState(1000);

    const t = {
        en: {
            title: 'Resource Allocation (Greedy)',
            desc: 'Distributing Iron & Folic Acid supplements using a',
            algo: 'Greedy Priority-First Algorithm',
            availStock: 'Available Stock of Supplements',
            demand: 'Demand',
            priority: 'Priority',
            allocated: 'Allocated',
            shortage: 'Shortage',
        },
        si: {
            title: 'සම්පත් වෙන් කිරීම (Greedy)',
            desc: 'යකඩ සහ ෆෝලික් අම්ල අතිරේක බෙදා හැරීම සඳහා භාවිතා වේ',
            algo: 'ගිජු ප්‍රමුඛතා පළමු (Greedy Priority-First) ඇල්ගොරිතමය',
            availStock: 'පවතින අතිරේක තොගය',
            demand: 'ඉල්ලුම',
            priority: 'ප්‍රමුඛතාවය',
            allocated: 'වෙන් කරන ලදී',
            shortage: 'හිඟය',
        },
        ta: {
            title: 'வள ஒதுக்கீடு (Greedy)',
            desc: 'இரும்பு மற்றும் ஃபோலிக் அமில சப்ளிமெண்ட்ஸ் விநியோகம்',
            algo: 'பேராசை முன்னுரிமை-முதல் (Greedy Priority) அல்காரிதம்',
            availStock: 'கிடைக்கக்கூடிய சப்ளிமெண்ட்ஸ் இருப்பு',
            demand: 'தேவை',
            priority: 'முன்னுரிமை',
            allocated: 'ஒதுக்கப்பட்டது',
            shortage: 'பற்றாக்குறை',
        },
    }[language];

    const allocation = useMemo(() => greedyAllocate(stock, DEMANDS), [stock]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" color="secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                <LocalPharmacyIcon fontSize="large" />
                {t.title}
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                {t.desc} <strong>{t.algo}</strong>.
            </Typography>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #F3E5F5 0%, #fff 100%)', border: '1px solid #CE93D8' }}>
                <Typography gutterBottom fontWeight={600} color="secondary">{t.availStock}</Typography>
                <Box sx={{ px: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Slider
                        value={stock}
                        min={0}
                        max={2000}
                        onChange={(_e, val) => setStock(val as number)}
                        sx={{ flexGrow: 1, color: 'secondary.main' }}
                    />
                    <Typography variant="h4" fontWeight={700} color="secondary">{stock}</Typography>
                </Box>
            </Paper>

            <Grid container spacing={2}>
                {DEMANDS.sort((a, b) => b.priority - a.priority).map((clinic) => (
                    <Grid item xs={12} md={6} lg={4} key={clinic.id}>
                        <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2, border: '1px solid #eee' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={700}>{clinic.id}</Typography>
                                    <Typography variant="body2" color="textSecondary">{t.demand}: {clinic.demand} | {t.priority}: {clinic.priority}/10</Typography>
                                </Box>
                                <Chip
                                    label={`${t.allocated}: ${allocation[clinic.id] || 0}`}
                                    color={allocation[clinic.id] === clinic.demand ? 'success' : 'warning'}
                                    variant="filled"
                                    sx={{ fontWeight: 600 }}
                                />
                            </Box>
                            
                            {allocation[clinic.id] < clinic.demand && (
                                <Box sx={{ bgcolor: '#FFEBEE', p: 1.5, borderRadius: 2 }}>
                                    <Typography variant="caption" display="block" color="error" fontWeight={600}>
                                        ⚠️ {t.shortage}: {clinic.demand - (allocation[clinic.id] || 0)}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
