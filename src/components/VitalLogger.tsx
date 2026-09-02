'use client';

import React, { useState } from 'react';
import {
    Box, Typography, Button, TextField, MenuItem, Grid,
    Paper, Chip, Stack, Avatar,
    ToggleButton, ToggleButtonGroup, Alert, IconButton
} from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useHealthStore, VitalLog } from '@/store/useHealthStore';
import { v4 as uuidv4 } from 'uuid';

// ─── Clinical Classification Helpers ────────────────────────────────
function classifyBP(systolic: number, diastolic: number): { label: string; color: 'success' | 'info' | 'warning' | 'error' } {
    if (systolic < 90 || diastolic < 60) return { label: 'Low (Hypotension)', color: 'info' };
    if (systolic < 120 && diastolic < 80) return { label: 'Normal', color: 'success' };
    if (systolic < 130 && diastolic < 80) return { label: 'Elevated', color: 'warning' };
    if (systolic < 140 || diastolic < 90) return { label: 'High – Stage 1', color: 'warning' };
    if (systolic < 180 || diastolic < 120) return { label: 'High – Stage 2', color: 'error' };
    return { label: 'Hypertensive Crisis', color: 'error' };
}

function classifyGlucose(value: number, timing: string): { label: string; color: 'success' | 'info' | 'warning' | 'error' } {
    if (timing === 'fasting') {
        if (value < 70) return { label: 'Hypoglycaemic', color: 'info' };
        if (value <= 99) return { label: 'Normal', color: 'success' };
        if (value <= 125) return { label: 'Pre-diabetic', color: 'warning' };
        return { label: 'Diabetic Range', color: 'error' };
    }
    // Post-meal / Random
    if (value < 70) return { label: 'Hypoglycaemic', color: 'info' };
    if (value <= 140) return { label: 'Normal', color: 'success' };
    if (value <= 199) return { label: 'Pre-diabetic', color: 'warning' };
    return { label: 'Diabetic Range', color: 'error' };
}

function classifyBMI(bmi: number): { label: string; color: 'success' | 'info' | 'warning' | 'error' } {
    if (bmi < 18.5) return { label: 'Underweight', color: 'info' };
    if (bmi < 25) return { label: 'Normal', color: 'success' };
    if (bmi < 30) return { label: 'Overweight', color: 'warning' };
    return { label: 'Obese', color: 'error' };
}

const GLUCOSE_TIMING = [
    { value: 'fasting', label: { en: 'Fasting', si: 'උපවාස', ta: 'உண்ணாவிரதம்' } },
    { value: 'postmeal', label: { en: 'Post-meal', si: 'ආහාරයෙන් පසු', ta: 'உணவுக்குப் பின்' } },
    { value: 'random', label: { en: 'Random', si: 'අහඹු', ta: 'சீரற்ற' } },
];

const VITAL_ICONS: Record<string, React.ReactNode> = {
    bp: <FavoriteIcon />,
    glucose: <BloodtypeIcon />,
    weight: <MonitorWeightIcon />,
};

const VITAL_COLORS: Record<string, string> = {
    bp: '#D81B60',
    glucose: '#7B1FA2',
    weight: '#1565C0',
};

export default function VitalLogger() {
    const { addLog, updateVitalLog, deleteVitalLog, language, getVitalLogs, userProfile } = useHealthStore();
    const [vitalType, setVitalType] = useState<'bp' | 'glucose' | 'weight'>('bp');
    const [editingVitalId, setEditingVitalId] = useState<string | null>(null);

    // BP fields
    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    // Glucose fields
    const [glucoseValue, setGlucoseValue] = useState('');
    const [glucoseTiming, setGlucoseTiming] = useState('fasting');
    // Weight field
    const [weightKg, setWeightKg] = useState('');

    const vitalLogs = getVitalLogs();

    const t = {
        en: {
            title: 'Vitals & Symptoms',
            logEntry: 'Log Entry',
            recentLogs: 'Recent Logs',
            noLogs: 'No vital signs logged yet. Start tracking your health!',
            systolic: 'Systolic (mmHg)',
            diastolic: 'Diastolic (mmHg)',
            glucoseVal: 'Glucose (mg/dL)',
            timing: 'Timing',
            weight: 'Weight (kg)',
            bmi: 'BMI',
            bp: 'Blood Pressure',
            glucose: 'Blood Glucose',
            weightLabel: 'Weight',
            classification: 'Status',
        },
        si: {
            title: 'සෞඛ්‍ය දර්ශක',
            logEntry: 'සටහන් කරන්න',
            recentLogs: 'මෑත සටහන්',
            noLogs: 'තවමත් සෞඛ්‍ය දර්ශක සටහන් කර නැත.',
            systolic: 'සිස්ටොලික් (mmHg)',
            diastolic: 'ඩයස්ටොලික් (mmHg)',
            glucoseVal: 'ග්ලූකෝස් (mg/dL)',
            timing: 'කාලය',
            weight: 'බර (kg)',
            bmi: 'BMI',
            bp: 'රුධිර පීඩනය',
            glucose: 'රුධිර සීනි',
            weightLabel: 'බර',
            classification: 'තත්ත්වය',
        },
        ta: {
            title: 'உடல்நல குறிகாட்டிகள்',
            logEntry: 'பதிவு செய்க',
            recentLogs: 'சமீபத்திய பதிவுகள்',
            noLogs: 'இதுவரை உடல்நலக் குறிகாட்டிகள் பதிவு செய்யப்படவில்லை.',
            systolic: 'சிஸ்டோலிக் (mmHg)',
            diastolic: 'டையஸ்டோலிக் (mmHg)',
            glucoseVal: 'குளூக்கோஸ் (mg/dL)',
            timing: 'நேரம்',
            weight: 'எடை (kg)',
            bmi: 'BMI',
            bp: 'இரத்த அழுத்தம்',
            glucose: 'இரத்தச் சர்க்கரை',
            weightLabel: 'எடை',
            classification: 'நிலை',
        },
    }[language];

    const handleSubmit = () => {
        let value: any = {};
        let classification = '';
        let classificationColor: VitalLog['classificationColor'] = 'info';

        if (vitalType === 'bp') {
            const sys = parseInt(systolic);
            const dia = parseInt(diastolic);
            if (isNaN(sys) || isNaN(dia)) return;
            value = { systolic: sys, diastolic: dia };
            const cls = classifyBP(sys, dia);
            classification = cls.label;
            classificationColor = cls.color;
        } else if (vitalType === 'glucose') {
            const val = parseFloat(glucoseValue);
            if (isNaN(val)) return;
            value = { value: val, timing: glucoseTiming };
            const cls = classifyGlucose(val, glucoseTiming);
            classification = cls.label;
            classificationColor = cls.color;
        } else if (vitalType === 'weight') {
            const kg = parseFloat(weightKg);
            if (isNaN(kg)) return;
            const heightM = userProfile.heightCm / 100;
            const bmi = parseFloat((kg / (heightM * heightM)).toFixed(1));
            value = { kg, bmi };
            const cls = classifyBMI(bmi);
            classification = cls.label;
            classificationColor = cls.color;
        }

        if (editingVitalId) {
            updateVitalLog(editingVitalId, {
                vitalType,
                value,
                classification,
                classificationColor,
            });
            setEditingVitalId(null);
        } else {
            const log: VitalLog = {
                id: uuidv4(),
                date: new Date().toISOString(),
                type: 'vital',
                vitalType,
                value,
                classification,
                classificationColor,
            };
            addLog(log);
        }

        setSystolic('');
        setDiastolic('');
        setGlucoseValue('');
        setWeightKg('');
    };

    const handleEditVital = (log: VitalLog) => {
        setVitalType(log.vitalType);
        if (log.vitalType === 'bp') {
            setSystolic(log.value.systolic.toString());
            setDiastolic(log.value.diastolic.toString());
        } else if (log.vitalType === 'glucose') {
            setGlucoseValue(log.value.value.toString());
            setGlucoseTiming(log.value.timing);
        } else if (log.vitalType === 'weight') {
            setWeightKg(log.value.kg.toString());
        }
        setEditingVitalId(log.id);
        // scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredLogs = vitalLogs.filter(l => l.vitalType === vitalType).reverse().slice(0, 8);

    const handleDeleteVital = (id: string) => {
        if (window.confirm(language === 'en' ? 'Delete this vital log?' : language === 'si' ? 'මෙම සටහන මකන්නද?' : 'இந்த பதிவை நீக்கவா?')) {
            deleteVitalLog(id);
        }
    };

    const vitalNames: Record<string, string> = { bp: t.bp, glucose: t.glucose, weight: t.weightLabel };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
                {t.title}
            </Typography>

            <Grid container spacing={3}>
                {/* Input Card */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #f0f0f0' }}>
                        {/* Vital Type Selector */}
                        <ToggleButtonGroup
                            value={vitalType}
                            exclusive
                            onChange={(_, val) => val && setVitalType(val)}
                            fullWidth
                            sx={{ mb: 3 }}
                        >
                            <ToggleButton value="bp" sx={{
                                textTransform: 'none', fontWeight: 600,
                                '&.Mui-selected': { bgcolor: '#FCE4EC', color: '#D81B60', borderColor: '#D81B60' }
                            }}>
                                <FavoriteIcon sx={{ mr: 1, fontSize: 18 }} /> {t.bp}
                            </ToggleButton>
                            <ToggleButton value="glucose" sx={{
                                textTransform: 'none', fontWeight: 600,
                                '&.Mui-selected': { bgcolor: '#F3E5F5', color: '#7B1FA2', borderColor: '#7B1FA2' }
                            }}>
                                <BloodtypeIcon sx={{ mr: 1, fontSize: 18 }} /> {t.glucose}
                            </ToggleButton>
                            <ToggleButton value="weight" sx={{
                                textTransform: 'none', fontWeight: 600,
                                '&.Mui-selected': { bgcolor: '#E3F2FD', color: '#1565C0', borderColor: '#1565C0' }
                            }}>
                                <MonitorWeightIcon sx={{ mr: 1, fontSize: 18 }} /> {t.weightLabel}
                            </ToggleButton>
                        </ToggleButtonGroup>

                        {/* Dynamic Input Fields */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {vitalType === 'bp' && (
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            label={t.systolic}
                                            type="number"
                                            fullWidth
                                            value={systolic}
                                            onChange={(e) => setSystolic(e.target.value)}
                                            placeholder="120"
                                            InputProps={{ inputProps: { min: 60, max: 300 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            label={t.diastolic}
                                            type="number"
                                            fullWidth
                                            value={diastolic}
                                            onChange={(e) => setDiastolic(e.target.value)}
                                            placeholder="80"
                                            InputProps={{ inputProps: { min: 30, max: 200 } }}
                                        />
                                    </Grid>
                                    {systolic && diastolic && (
                                        <Grid item xs={12}>
                                            <Alert severity={classifyBP(parseInt(systolic), parseInt(diastolic)).color} sx={{ borderRadius: 2 }}>
                                                <strong>{t.classification}:</strong> {classifyBP(parseInt(systolic), parseInt(diastolic)).label} — {systolic}/{diastolic} mmHg
                                            </Alert>
                                        </Grid>
                                    )}
                                </Grid>
                            )}

                            {vitalType === 'glucose' && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        label={t.glucoseVal}
                                        type="number"
                                        fullWidth
                                        value={glucoseValue}
                                        onChange={(e) => setGlucoseValue(e.target.value)}
                                        placeholder="95"
                                        InputProps={{ inputProps: { min: 20, max: 600 } }}
                                    />
                                    <TextField
                                        select
                                        label={t.timing}
                                        fullWidth
                                        value={glucoseTiming}
                                        onChange={(e) => setGlucoseTiming(e.target.value)}
                                    >
                                        {GLUCOSE_TIMING.map(opt => (
                                            <MenuItem key={opt.value} value={opt.value}>
                                                {opt.label[language]}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    {glucoseValue && (
                                        <Alert severity={classifyGlucose(parseFloat(glucoseValue), glucoseTiming).color} sx={{ borderRadius: 2 }}>
                                            <strong>{t.classification}:</strong> {classifyGlucose(parseFloat(glucoseValue), glucoseTiming).label} — {glucoseValue} mg/dL ({GLUCOSE_TIMING.find(g => g.value === glucoseTiming)?.label[language]})
                                        </Alert>
                                    )}
                                </Box>
                            )}

                            {vitalType === 'weight' && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField
                                        label={t.weight}
                                        type="number"
                                        fullWidth
                                        value={weightKg}
                                        onChange={(e) => setWeightKg(e.target.value)}
                                        placeholder="58"
                                        InputProps={{ inputProps: { min: 20, max: 300, step: 0.1 } }}
                                    />
                                    {weightKg && (
                                        <Box>
                                            {(() => {
                                                const bmi = parseFloat(weightKg) / ((userProfile.heightCm / 100) ** 2);
                                                const cls = classifyBMI(bmi);
                                                return (
                                                    <Alert severity={cls.color} sx={{ borderRadius: 2 }}>
                                                        <strong>{t.bmi}:</strong> {bmi.toFixed(1)} — {cls.label}
                                                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                                            ({language === 'en' ? 'Based on height' : language === 'si' ? 'උස මත පදනම්ව' : 'உயரத்தின் அடிப்படையில்'}: {userProfile.heightCm}cm)
                                                        </Typography>
                                                    </Alert>
                                                );
                                            })()}
                                        </Box>
                                    )}
                                </Box>
                            )}

                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    fullWidth
                                    sx={{
                                        borderRadius: 8, py: 1.5, mb: 1,
                                        background: `linear-gradient(135deg, ${VITAL_COLORS[vitalType]} 0%, ${VITAL_COLORS[vitalType]}bb 100%)`,
                                        boxShadow: `0 4px 15px ${VITAL_COLORS[vitalType]}44`,
                                    }}
                                >
                                    {editingVitalId ? (language === 'en' ? 'Update Entry' : language === 'si' ? 'සටහන යාවත්කාලීන කරන්න' : 'பதிவைப் புதுப்பிக்கவும்') : t.logEntry}
                                </Button>
                                {editingVitalId && (
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            setEditingVitalId(null);
                                            setSystolic('');
                                            setDiastolic('');
                                            setGlucoseValue('');
                                            setWeightKg('');
                                        }}
                                        fullWidth
                                        sx={{ borderRadius: 8, py: 1 }}
                                    >
                                        {language === 'en' ? 'Cancel Edit' : language === 'si' ? 'අවලංගු කරන්න' : 'ரத்து செய்'}
                                    </Button>
                                )}
                            </Box>
                    </Paper>
                </Grid>

                {/* Timeline */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TimelineIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>{t.recentLogs} — {vitalNames[vitalType]}</Typography>
                    </Box>

                    {filteredLogs.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #ccc' }}>
                            <HealthAndSafetyIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                            <Typography color="textSecondary">{t.noLogs}</Typography>
                        </Paper>
                    ) : (
                        <Stack spacing={1.5}>
                            {filteredLogs.map((log) => (
                                <Paper key={log.id} sx={{
                                    p: 2, borderRadius: 2,
                                    borderLeft: `4px solid ${VITAL_COLORS[log.vitalType]}`,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': { transform: 'translateX(4px)', boxShadow: 3 },
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                            <Avatar sx={{ bgcolor: `${VITAL_COLORS[log.vitalType]}22`, width: 36, height: 36 }}>
                                                {React.cloneElement(VITAL_ICONS[log.vitalType] as React.ReactElement<any>, { sx: { color: VITAL_COLORS[log.vitalType], fontSize: 20 } })}
                                            </Avatar>
                                            <Box>
                                                <Typography fontWeight={600} fontSize="0.95rem">
                                                    {log.vitalType === 'bp' && `${log.value.systolic}/${log.value.diastolic} mmHg`}
                                                    {log.vitalType === 'glucose' && `${log.value.value} mg/dL`}
                                                    {log.vitalType === 'weight' && `${log.value.kg} kg (BMI: ${log.value.bmi})`}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {new Date(log.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                    {log.vitalType === 'glucose' && ` · ${GLUCOSE_TIMING.find(g => g.value === log.value.timing)?.label[language]}`}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Chip
                                                label={log.classification}
                                                size="small"
                                                color={log.classificationColor}
                                                variant="filled"
                                                sx={{ fontWeight: 600, minWidth: 80, justifyContent: 'center' }}
                                            />
                                            <IconButton size="small" onClick={() => handleEditVital(log)}
                                                sx={{ color: '#1565C0', '&:hover': { bgcolor: '#E3F2FD' } }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDeleteVital(log.id)}
                                                sx={{ color: '#c62828', '&:hover': { bgcolor: '#FFEBEE' } }}>
                                                <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}
