'use client';

import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, ReferenceLine, ReferenceArea, Legend
} from 'recharts';
import { Box, Typography, Paper, ToggleButton, ToggleButtonGroup, Chip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { useHealthStore } from '@/store/useHealthStore';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
        <Paper sx={{ p: 1.5, borderRadius: 2, boxShadow: 3, minWidth: 160 }}>
            <Typography variant="caption" color="textSecondary" fontWeight={600}>{label}</Typography>
            {payload.map((entry: any, i: number) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.stroke || entry.color }} />
                    <Typography variant="body2" fontWeight={500}>
                        {entry.name}: <strong>{entry.value}</strong>
                    </Typography>
                </Box>
            ))}
            {payload[0]?.payload?.classification && (
                <Chip
                    label={payload[0].payload.classification}
                    size="small"
                    color={payload[0].payload.classificationColor || 'default'}
                    sx={{ mt: 1, fontWeight: 600, fontSize: '0.7rem' }}
                />
            )}
        </Paper>
    );
};

export default function HealthCharts() {
    const { language, getVitalLogs } = useHealthStore();
    const [metric, setMetric] = useState<'bp' | 'glucose' | 'weight'>('bp');

    const t = {
        en: {
            title: 'Health Trends',
            bp: 'Blood Pressure',
            glucose: 'Glucose',
            weight: 'Weight & BMI',
            noData: 'No data yet — log some vitals to see trends here.',
            systolic: 'Systolic',
            diastolic: 'Diastolic',
            normalZone: 'Normal Zone',
            glucoseVal: 'Glucose (mg/dL)',
            weightVal: 'Weight (kg)',
            bmiVal: 'BMI',
        },
        si: {
            title: 'සෞඛ්‍ය ප්‍රස්ථාර',
            bp: 'රුධිර පීඩනය',
            glucose: 'ග්ලූකෝස්',
            weight: 'බර & BMI',
            noData: 'දත්ත නැත — ප්‍රස්ථාර බැලීමට සෞඛ්‍ය දර්ශක සටහන් කරන්න.',
            systolic: 'සිස්ටොලික්',
            diastolic: 'ඩයස්ටොලික්',
            normalZone: 'සාමාන්‍ය පරාසය',
            glucoseVal: 'ග්ලූකෝස් (mg/dL)',
            weightVal: 'බර (kg)',
            bmiVal: 'BMI',
        },
        ta: {
            title: 'சுகாதார போக்குகள்',
            bp: 'இரத்த அழுத்தம்',
            glucose: 'குளூக்கோஸ்',
            weight: 'எடை & BMI',
            noData: 'இதுவரை தரவு இல்லை — போக்குகளைக் காண, உடல்நலக் குறிகாட்டிகளை பதிவு செய்யுங்கள்.',
            systolic: 'சிஸ்டோலிக்',
            diastolic: 'டையஸ்டோலிக்',
            normalZone: 'இயல்பான வரம்பு',
            glucoseVal: 'குளூக்கோஸ் (mg/dL)',
            weightVal: 'எடை (kg)',
            bmiVal: 'BMI',
        },
    }[language];

    const bpLogs = getVitalLogs('bp');
    const glucoseLogs = getVitalLogs('glucose');
    const weightLogs = getVitalLogs('weight');

    const bpData = bpLogs.map(log => ({
        date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        systolic: log.value.systolic,
        diastolic: log.value.diastolic,
        classification: log.classification,
        classificationColor: log.classificationColor,
    }));

    const glucoseData = glucoseLogs.map(log => ({
        date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: log.value.value,
        timing: log.value.timing,
        classification: log.classification,
        classificationColor: log.classificationColor,
    }));

    const weightData = weightLogs.map(log => ({
        date: new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        weight: log.value.kg,
        bmi: log.value.bmi,
        classification: log.classification,
        classificationColor: log.classificationColor,
    }));

    const hasData = (metric === 'bp' && bpData.length > 0) ||
        (metric === 'glucose' && glucoseData.length > 0) ||
        (metric === 'weight' && weightData.length > 0);

    return (
        <Box sx={{ mt: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShowChartIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>{t.title}</Typography>
                </Box>
                <ToggleButtonGroup
                    value={metric}
                    exclusive
                    onChange={(_, val) => val && setMetric(val)}
                    size="small"
                >
                    <ToggleButton value="bp" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                        <FavoriteIcon sx={{ fontSize: 16, mr: 0.5 }} /> {t.bp}
                    </ToggleButton>
                    <ToggleButton value="glucose" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                        <BloodtypeIcon sx={{ fontSize: 16, mr: 0.5 }} /> {t.glucose}
                    </ToggleButton>
                    <ToggleButton value="weight" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
                        <MonitorWeightIcon sx={{ fontSize: 16, mr: 0.5 }} /> {t.weight}
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'background.paper', height: 320, border: '1px solid #f0f0f0' }}>
                {!hasData ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <ShowChartIcon sx={{ fontSize: 56, color: '#e0e0e0', mb: 1 }} />
                        <Typography color="textSecondary" textAlign="center">{t.noData}</Typography>
                    </Box>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        {metric === 'bp' ? (
                            <AreaChart data={bpData}>
                                <defs>
                                    <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D81B60" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#D81B60" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDia" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1565C0" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} domain={[50, 200]} />
                                <Tooltip content={<CustomTooltip metric="bp" />} />
                                <Legend />
                                {/* Normal BP zone */}
                                <ReferenceArea y1={60} y2={80} fill="#43A04711" label="" />
                                <ReferenceArea y1={90} y2={120} fill="#43A04711" label="" />
                                <ReferenceLine y={120} stroke="#43A047" strokeDasharray="5 5" label={{ value: '120', position: 'right', fontSize: 10, fill: '#43A047' }} />
                                <ReferenceLine y={80} stroke="#43A047" strokeDasharray="5 5" label={{ value: '80', position: 'right', fontSize: 10, fill: '#43A047' }} />
                                <Area type="monotone" dataKey="systolic" name={t.systolic} stroke="#D81B60" fillOpacity={1} fill="url(#colorSys)" strokeWidth={2.5} dot={{ r: 4, fill: '#D81B60' }} />
                                <Area type="monotone" dataKey="diastolic" name={t.diastolic} stroke="#1565C0" fillOpacity={1} fill="url(#colorDia)" strokeWidth={2.5} dot={{ r: 4, fill: '#1565C0' }} />
                            </AreaChart>
                        ) : metric === 'glucose' ? (
                            <AreaChart data={glucoseData}>
                                <defs>
                                    <linearGradient id="colorGlc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7B1FA2" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#7B1FA2" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} domain={[40, 300]} />
                                <Tooltip content={<CustomTooltip metric="glucose" />} />
                                <ReferenceArea y1={70} y2={99} fill="#43A04711" />
                                <ReferenceLine y={99} stroke="#43A047" strokeDasharray="5 5" label={{ value: '99', position: 'right', fontSize: 10, fill: '#43A047' }} />
                                <ReferenceLine y={126} stroke="#e65100" strokeDasharray="5 5" label={{ value: '126', position: 'right', fontSize: 10, fill: '#e65100' }} />
                                <Area type="monotone" dataKey="value" name={t.glucoseVal} stroke="#7B1FA2" fillOpacity={1} fill="url(#colorGlc)" strokeWidth={2.5} dot={{ r: 4, fill: '#7B1FA2' }} />
                            </AreaChart>
                        ) : (
                            <LineChart data={weightData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="left" tick={{ fontSize: 12 }} label={{ value: 'kg', position: 'insideTopLeft', offset: -5, fontSize: 11 }} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} domain={[15, 40]} label={{ value: 'BMI', position: 'insideTopRight', offset: -5, fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip metric="weight" />} />
                                <Legend />
                                <ReferenceLine yAxisId="right" y={18.5} stroke="#1565C0" strokeDasharray="5 5" />
                                <ReferenceLine yAxisId="right" y={25} stroke="#e65100" strokeDasharray="5 5" />
                                <Line yAxisId="left" type="monotone" dataKey="weight" name={t.weightVal} stroke="#1565C0" strokeWidth={2.5} dot={{ r: 4, fill: '#1565C0' }} />
                                <Line yAxisId="right" type="monotone" dataKey="bmi" name={t.bmiVal} stroke="#FF6F00" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#FF6F00' }} />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                )}
            </Paper>
        </Box>
    );
}
