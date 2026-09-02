'use client';

import React, { useState, useMemo } from 'react';
import {
    Box, Typography, Button, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, Paper, Chip,
    Grid, Rating, ToggleButton, ToggleButtonGroup, IconButton,
    Tooltip, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';

import WaterDropIcon from '@mui/icons-material/WaterDrop';
import FavoriteIcon from '@mui/icons-material/Favorite';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useHealthStore, CycleLog } from '@/store/useHealthStore';
import { v4 as uuidv4 } from 'uuid';

const FLOW_OPTIONS = [
    { value: 'spotting', label: { en: 'Spotting', si: 'තිත්', ta: 'புள்ளிகள்' }, color: '#F8BBD0' },
    { value: 'light', label: { en: 'Light', si: 'සැහැල්ලු', ta: 'லேசானது' }, color: '#F48FB1' },
    { value: 'medium', label: { en: 'Medium', si: 'මධ්‍යම', ta: 'நடுத்தரம்' }, color: '#EC407A' },
    { value: 'heavy', label: { en: 'Heavy', si: 'අධික', ta: 'அதிகம்' }, color: '#C2185B' },
] as const;

const MOOD_OPTIONS = [
    { value: 'great', emoji: '😊', label: { en: 'Great', si: 'නියමයි', ta: 'சிறப்பு' } },
    { value: 'good', emoji: '🙂', label: { en: 'Good', si: 'හොඳයි', ta: 'நல்லது' } },
    { value: 'neutral', emoji: '😐', label: { en: 'Neutral', si: 'සාමාන්‍ය', ta: 'சாதாரணம்' } },
    { value: 'low', emoji: '😔', label: { en: 'Low', si: 'අඩු', ta: 'குறைவு' } },
    { value: 'terrible', emoji: '😢', label: { en: 'Terrible', si: 'දරුණු', ta: 'மோசம்' } },
] as const;

const SYMPTOM_OPTIONS = [
    { value: 'fatigue', label: { en: 'Fatigue', si: 'තෙහෙට්ටුව', ta: 'சோர்வு' }, icon: '😴' },
    { value: 'bloating', label: { en: 'Bloating', si: 'බඩ පිපීම', ta: 'வீக்கம்' }, icon: '🫧' },
    { value: 'headache', label: { en: 'Headache', si: 'හිසරදය', ta: 'தலைவலி' }, icon: '🤕' },
    { value: 'cramps', label: { en: 'Cramps', si: 'කැක්කුම', ta: 'பிடிப்புகள்' }, icon: '💢' },
    { value: 'backpain', label: { en: 'Back Pain', si: 'පිට රිදුම', ta: 'முதுகுவலி' }, icon: '🔴' },
    { value: 'nausea', label: { en: 'Nausea', si: 'ඔක්කාරය', ta: 'குமட்டல்' }, icon: '🤢' },
    { value: 'tender_breasts', label: { en: 'Breast Tenderness', si: 'පියයුරු වේදනාව', ta: 'மார்பக வலி' }, icon: '⚠️' },
    { value: 'acne', label: { en: 'Acne', si: 'කුරුලෑ', ta: 'முகப்பரு' }, icon: '🔴' },
];

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

export default function MenstrualTracker() {
    const { addLog, updateCycleLog, deleteCycleLog, language, getCycleLogs, getCycleSettings, getNextPeriodDate, getCurrentCyclePhase } = useHealthStore();
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');
    const [flowIntensity, setFlowIntensity] = useState<CycleLog['flowIntensity']>('medium');
    const [cramps, setCramps] = useState(3);
    const [mood, setMood] = useState<CycleLog['mood']>('neutral');
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [editingLog, setEditingLog] = useState<CycleLog | null>(null);

    // Calendar state
    const [calendarDate, setCalendarDate] = useState(new Date());
    const calYear = calendarDate.getFullYear();
    const calMonth = calendarDate.getMonth();

    const cycleLogs = getCycleLogs();
    const cycleSettings = getCycleSettings();
    const nextPeriod = getNextPeriodDate();
    const currentPhase = getCurrentCyclePhase();

    // Build a set of logged dates for the calendar
    const loggedDates = useMemo(() => {
        const set = new Set<string>();
        cycleLogs.forEach(log => {
            set.add(new Date(log.date).toISOString().split('T')[0]);
        });
        return set;
    }, [cycleLogs]);

    // Predicted period dates (next 5 days from predicted start)
    const predictedDates = useMemo(() => {
        const set = new Set<string>();
        if (nextPeriod) {
            for (let i = 0; i < cycleSettings.avgPeriodDuration; i++) {
                const d = new Date(nextPeriod);
                d.setDate(d.getDate() + i);
                set.add(d.toISOString().split('T')[0]);
            }
        }
        return set;
    }, [nextPeriod, cycleSettings]);

    // Fertile window: approx days 11-16 from last period
    const fertileDates = useMemo(() => {
        const set = new Set<string>();
        if (cycleLogs.length > 0) {
            const lastPeriod = new Date(cycleLogs[cycleLogs.length - 1].date);
            for (let i = 10; i <= 16; i++) {
                const d = new Date(lastPeriod);
                d.setDate(d.getDate() + i);
                set.add(d.toISOString().split('T')[0]);
            }
        }
        return set;
    }, [cycleLogs]);

    const handleOpen = () => {
        setEditingLog(null);
        setDate(new Date().toISOString().split('T')[0]);
        setNote('');
        setSymptoms([]);
        setCramps(3);
        setMood('neutral');
        setFlowIntensity('medium');
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        setEditingLog(null);
    };

    const toggleSymptom = (sym: string) => {
        setSymptoms(prev => prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]);
    };

    const handleSubmit = () => {
        if (editingLog) {
            updateCycleLog(editingLog.id, {
                date,
                note,
                flowIntensity,
                cramps,
                mood,
                symptoms,
            });
        } else {
            const log: CycleLog = {
                id: uuidv4(),
                date,
                type: 'cycle',
                note,
                flowIntensity,
                cramps,
                mood,
                symptoms,
            };
            addLog(log);
        }
        handleClose();
    };

    const handleEdit = (log: CycleLog) => {
        setEditingLog(log);
        setDate(new Date(log.date).toISOString().split('T')[0]);
        setFlowIntensity(log.flowIntensity);
        setCramps(log.cramps);
        setMood(log.mood);
        setSymptoms([...log.symptoms]);
        setNote(log.note || '');
        setOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm(language === 'en' ? 'Delete this log entry?' : language === 'si' ? 'මෙම සටහන මකන්නද?' : 'இந்த பதிவை நீக்கவா?')) {
            deleteCycleLog(id);
        }
    };

    const daysToNext = nextPeriod ? Math.max(0, Math.ceil((nextPeriod.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

    const t = {
        en: {
            cycleHistory: 'Cycle Tracker',
            logCycle: 'Log Period',
            noCycles: 'No periods logged yet. Start by tapping "Log Period".',
            logNew: 'Log Period Day',
            flow: 'Flow Intensity',
            crampsLabel: 'Cramps',
            moodLabel: 'Mood',
            symptomsLabel: 'Symptoms',
            save: 'Save',
            cancel: 'Cancel',
            daysUntil: 'days until next period',
            currentPhase: 'Current Phase',
            avgCycle: 'Avg Cycle',
            avgPeriod: 'Avg Period',
            days: 'days',
            cycleDay: 'Cycle Day',
            predicted: 'Predicted',
            fertile: 'Fertile Window',
            logged: 'Logged',
            today: 'Today',
        },
        si: {
            cycleHistory: 'ඔසප් සටහන',
            logCycle: 'ඔසප් සටහන් කරන්න',
            noCycles: 'තවමත් ඔසප් සටහන් කර නැත. "ඔසප් සටහන් කරන්න" ඔබන්න.',
            logNew: 'ඔසප් දිනය සටහන් කරන්න',
            flow: 'ප්‍රවාහ තීව්‍රතාව',
            crampsLabel: 'කැක්කුම',
            moodLabel: 'මනෝ තත්ත්වය',
            symptomsLabel: 'රෝග ලක්ෂණ',
            save: 'සුරකින්න',
            cancel: 'අවලංගු',
            daysUntil: 'දිනයි ඊළඟ ඔසප් වෙත',
            currentPhase: 'වත්මන් අවධිය',
            avgCycle: 'සාමාන්‍ය චක්‍ර',
            avgPeriod: 'සාමාන්‍ය ඔසප්',
            days: 'දින',
            cycleDay: 'චක්‍ර දිනය',
            predicted: 'අනාවැකි',
            fertile: 'සරු කාලය',
            logged: 'සටහන් කළ',
            today: 'අද',
        },
        ta: {
            cycleHistory: 'மாதவிடாய் கண்காணிப்பு',
            logCycle: 'மாதவிடாய் பதிவு',
            noCycles: 'இதுவரை பதிவுகள் இல்லை. "மாதவிடாய் பதிவு" தட்டவும்.',
            logNew: 'மாதவிடாய் நாள் பதிவு',
            flow: 'ப்ரவாக தீவிரம்',
            crampsLabel: 'பிடிப்புகள்',
            moodLabel: 'மனநிலை',
            symptomsLabel: 'அறிகுறிகள்',
            save: 'சேமி',
            cancel: 'ரத்து',
            daysUntil: 'நாட்கள் அடுத்த மாதவிடாய்க்கு',
            currentPhase: 'தற்போதைய நிலை',
            avgCycle: 'சராசரி சுழற்சி',
            avgPeriod: 'சராசரி மாதவிடாய்',
            days: 'நாட்கள்',
            cycleDay: 'சுழற்சி நாள்',
            predicted: 'கணிப்பு',
            fertile: 'கருவுறும் காலம்',
            logged: 'பதிவு',
            today: 'இன்று',
        },
    }[language];

    // Calendar rendering
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const monthNames = {
        en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        si: ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'],
        ta: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
    };

    const calCells: React.ReactNode[] = [];
    for (let i = 0; i < firstDay; i++) {
        calCells.push(<Box key={`empty-${i}`} sx={{ width: 40, height: 40 }} />);
    }
    const todayStr = new Date().toISOString().split('T')[0];
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isLogged = loggedDates.has(dateStr);
        const isPredicted = predictedDates.has(dateStr);
        const isFertile = fertileDates.has(dateStr);
        const isToday = dateStr === todayStr;

        let bgColor = 'transparent';
        let textColor = 'text.primary';
        let border = 'none';

        if (isLogged) { bgColor = '#D81B60'; textColor = '#fff'; }
        else if (isPredicted) { bgColor = 'rgba(216,27,96,0.15)'; border = '2px dashed #D81B60'; }
        else if (isFertile) { bgColor = 'rgba(255,111,0,0.12)'; border = '2px dashed #FF6F00'; }
        if (isToday && !isLogged) { border = '2px solid #1565C0'; }

        calCells.push(
            <Tooltip key={day} title={
                isLogged ? t.logged : isPredicted ? t.predicted : isFertile ? t.fertile : isToday ? t.today : ''
            }>
                <Box
                    sx={{
                        width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%', bgcolor: bgColor, color: textColor, border,
                        fontSize: '0.85rem', fontWeight: isToday || isLogged ? 700 : 400,
                        cursor: 'default', transition: 'all 0.2s',
                    }}
                >
                    {day}
                </Box>
            </Tooltip>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {t.cycleHistory}
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}
                    sx={{ borderRadius: 8, px: 3, background: 'linear-gradient(135deg, #D81B60 0%, #FF5C8D 100%)', boxShadow: '0 4px 15px rgba(216,27,96,0.3)' }}>
                    {t.logCycle}
                </Button>
            </Box>

            {/* Phase & Stats Strip */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* Current Phase Card */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{
                        p: 2, borderRadius: 3, textAlign: 'center',
                        background: `linear-gradient(135deg, ${currentPhase.color}22 0%, ${currentPhase.color}08 100%)`,
                        border: `1px solid ${currentPhase.color}33`,
                    }}>
                        <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            {t.currentPhase}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: currentPhase.color, my: 0.5 }}>
                            {currentPhase.phase}
                        </Typography>
                        <Chip label={`${t.cycleDay} ${currentPhase.day}`} size="small"
                            sx={{ bgcolor: currentPhase.color, color: '#fff', fontWeight: 600 }} />
                    </Paper>
                </Grid>

                {/* Days Until Next Period */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', background: 'linear-gradient(135deg, #FCE4EC 0%, #fff 100%)', border: '1px solid #F8BBD033' }}>
                        <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            {t.predicted}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#D81B60', my: 0.5 }}>
                            {daysToNext !== null ? daysToNext : '—'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">{t.daysUntil}</Typography>
                    </Paper>
                </Grid>

                {/* Avg Cycle Length */}
                <Grid item xs={6} sm={6} md={3}>
                    <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', background: 'linear-gradient(135deg, #EDE7F6 0%, #fff 100%)', border: '1px solid #D1C4E933' }}>
                        <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            {t.avgCycle}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#7B1FA2', my: 0.5 }}>
                            {cycleSettings.avgCycleLength}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">{t.days}</Typography>
                    </Paper>
                </Grid>

                {/* Avg Period Duration */}
                <Grid item xs={6} sm={6} md={3}>
                    <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', background: 'linear-gradient(135deg, #E3F2FD 0%, #fff 100%)', border: '1px solid #BBDEFB33' }}>
                        <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            {t.avgPeriod}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1565C0', my: 0.5 }}>
                            {cycleSettings.avgPeriodDuration}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">{t.days}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Calendar */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={() => setCalendarDate(new Date(calYear, calMonth - 1, 1))}>
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="h6" fontWeight={600}>
                        {monthNames[language][calMonth]} {calYear}
                    </Typography>
                    <IconButton onClick={() => setCalendarDate(new Date(calYear, calMonth + 1, 1))}>
                        <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* Day headers */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 1 }}>
                    {DAYS_OF_WEEK.map((d, i) => (
                        <Box key={i} sx={{ width: 40, textAlign: 'center' }}>
                            <Typography variant="caption" color="textSecondary" fontWeight={600}>{d}</Typography>
                        </Box>
                    ))}
                </Box>

                {/* Calendar grid */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
                    {calCells}
                </Box>

                {/* Legend */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#D81B60' }} />
                        <Typography variant="caption">{t.logged}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'rgba(216,27,96,0.15)', border: '1.5px dashed #D81B60' }} />
                        <Typography variant="caption">{t.predicted}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'rgba(255,111,0,0.12)', border: '1.5px dashed #FF6F00' }} />
                        <Typography variant="caption">{t.fertile}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #1565C0' }} />
                        <Typography variant="caption">{t.today}</Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Recent Logs */}
            {cycleLogs.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#FCE4EC22', borderRadius: 3, border: '1px dashed #F48FB1' }}>
                    <WaterDropIcon sx={{ fontSize: 48, color: '#F48FB1', mb: 1 }} />
                    <Typography color="textSecondary">{t.noCycles}</Typography>
                </Paper>
            ) : (
                <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        {language === 'en' ? 'Recent Logs' : language === 'si' ? 'මෑත සටහන්' : 'சமீபத்திய பதிவுகள்'}
                    </Typography>
                    <Stack spacing={1.5}>
                        {[...cycleLogs].reverse().slice(0, 5).map((log) => (
                            <Paper key={log.id} sx={{ p: 2, borderRadius: 2, border: '1px solid #f0f0f0' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography fontWeight={600}>{new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                            <Chip
                                                size="small"
                                                icon={<WaterDropIcon />}
                                                label={FLOW_OPTIONS.find(f => f.value === log.flowIntensity)?.label[language]}
                                                sx={{ bgcolor: FLOW_OPTIONS.find(f => f.value === log.flowIntensity)?.color, color: log.flowIntensity === 'heavy' ? '#fff' : undefined }}
                                            />
                                            <Chip size="small" label={`${MOOD_OPTIONS.find(m => m.value === log.mood)?.emoji} ${MOOD_OPTIONS.find(m => m.value === log.mood)?.label[language]}`} variant="outlined" />
                                            <Chip size="small" label={`${t.crampsLabel}: ${log.cramps}/5`} variant="outlined" color={log.cramps >= 4 ? 'error' : 'default'} />
                                        </Box>
                                        {log.symptoms.length > 0 && (
                                            <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {log.symptoms.map(sym => (
                                                    <Chip key={sym} size="small" variant="outlined"
                                                        label={`${SYMPTOM_OPTIONS.find(s => s.value === sym)?.icon} ${SYMPTOM_OPTIONS.find(s => s.value === sym)?.label[language]}`}
                                                        sx={{ fontSize: '0.7rem' }} />
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton size="small" onClick={() => handleEdit(log)}
                                            sx={{ color: '#1565C0', '&:hover': { bgcolor: '#E3F2FD' } }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(log.id)}
                                            sx={{ color: '#c62828', '&:hover': { bgcolor: '#FFEBEE' } }}>
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                                {log.note && <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>{log.note}</Typography>}
                            </Paper>
                        ))}
                    </Stack>
                </Box>
            )}

            {/* Log Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>{editingLog ? (language === 'en' ? 'Edit Log Entry' : language === 'si' ? 'සටහන සංස්කරණය' : 'பதிவை திருத்து') : t.logNew}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label={language === 'en' ? 'Date' : language === 'si' ? 'දිනය' : 'தேதி'}
                            type="date"
                            fullWidth
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />

                        {/* Flow Intensity */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom fontWeight={600}>{t.flow}</Typography>
                            <ToggleButtonGroup
                                value={flowIntensity}
                                exclusive
                                onChange={(_, val) => val && setFlowIntensity(val)}
                                fullWidth
                                size="small"
                            >
                                {FLOW_OPTIONS.map(opt => (
                                    <ToggleButton key={opt.value} value={opt.value}
                                        sx={{
                                            '&.Mui-selected': { bgcolor: opt.color, color: opt.value === 'heavy' ? '#fff' : undefined },
                                            textTransform: 'none', fontSize: '0.8rem',
                                        }}>
                                        {opt.label[language]}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Box>

                        {/* Cramps */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom fontWeight={600}>{t.crampsLabel} ({cramps}/5)</Typography>
                            <Rating value={cramps} max={5} onChange={(_, val) => val && setCramps(val)}
                                icon={<FavoriteIcon sx={{ color: '#D81B60' }} />}
                                emptyIcon={<FavoriteIcon sx={{ color: '#F8BBD0' }} />}
                            />
                        </Box>

                        {/* Mood */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom fontWeight={600}>{t.moodLabel}</Typography>
                            <ToggleButtonGroup
                                value={mood}
                                exclusive
                                onChange={(_, val) => val && setMood(val)}
                                fullWidth
                                size="small"
                            >
                                {MOOD_OPTIONS.map(opt => (
                                    <ToggleButton key={opt.value} value={opt.value} sx={{ textTransform: 'none' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.4rem' }}>{opt.emoji}</span>
                                            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>{opt.label[language]}</Typography>
                                        </Box>
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Box>

                        {/* Symptoms */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom fontWeight={600}>{t.symptomsLabel}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {SYMPTOM_OPTIONS.map(sym => (
                                    <Chip
                                        key={sym.value}
                                        label={`${sym.icon} ${sym.label[language]}`}
                                        variant={symptoms.includes(sym.value) ? 'filled' : 'outlined'}
                                        color={symptoms.includes(sym.value) ? 'primary' : 'default'}
                                        onClick={() => toggleSymptom(sym.value)}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* Notes */}
                        <TextField
                            label={language === 'en' ? 'Notes (optional)' : language === 'si' ? 'සටහන් (විකල්ප)' : 'குறிப்புகள் (விருப்ப)'}
                            fullWidth
                            multiline
                            rows={2}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose}>{t.cancel}</Button>
                    <Button onClick={handleSubmit} variant="contained"
                        sx={{ borderRadius: 6, px: 4, background: 'linear-gradient(135deg, #D81B60 0%, #FF5C8D 100%)' }}>
                        {editingLog ? (language === 'en' ? 'Update' : language === 'si' ? 'යාවත්කාලීන' : 'புதுப்பிக்கவும்') : t.save}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
