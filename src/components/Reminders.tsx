'use client';

import React, { useState, useMemo } from 'react';
import {
    Box, Typography, Button, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, Paper, IconButton, Chip, Stack,
    ToggleButton, ToggleButtonGroup, Avatar, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MedicationIcon from '@mui/icons-material/Medication';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import EventIcon from '@mui/icons-material/Event';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useHealthStore, Reminder, ReminderCategory } from '@/store/useHealthStore';

const CATEGORY_CONFIG: Record<ReminderCategory, { icon: React.ReactNode; color: string; emoji: string }> = {
    medication: { icon: <MedicationIcon />, color: '#7B1FA2', emoji: '💊' },
    appointment: { icon: <LocalHospitalIcon />, color: '#1565C0', emoji: '🏥' },
    vaccination: { icon: <VaccinesIcon />, color: '#43A047', emoji: '💉' },
    checkup: { icon: <MonitorHeartIcon />, color: '#D81B60', emoji: '🩺' },
    other: { icon: <EventIcon />, color: '#FF6F00', emoji: '📋' },
};

function getUrgency(time: number): { label: string; color: 'error' | 'warning' | 'success' | 'default'; priority: number } {
    const now = Date.now();
    const diff = time - now;
    const hours = diff / (1000 * 60 * 60);

    if (diff < 0) return { label: 'Overdue', color: 'error', priority: 0 };
    if (hours < 24) return { label: 'Today', color: 'warning', priority: 1 };
    if (hours < 72) return { label: 'Soon', color: 'default', priority: 2 };
    return { label: 'Upcoming', color: 'success', priority: 3 };
}

export default function Reminders() {
    const { reminders, addReminder, deleteReminderById, updateReminder, language } = useHealthStore();
    const [open, setOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [time, setTime] = useState(new Date().toISOString().slice(0, 16));
    const [category, setCategory] = useState<ReminderCategory>('medication');

    const t = {
        en: {
            title: 'Reminders',
            addReminder: 'Add Reminder',
            noReminders: 'All caught up! No upcoming reminders.',
            newReminder: 'New Reminder',
            whatRemind: 'What should we remind you?',
            descriptionLabel: 'Description (optional)',
            dateTime: 'Date & Time',
            categoryLabel: 'Category',
            setReminder: 'Set Reminder',
            cancel: 'Cancel',
            overdue: 'Overdue',
            upcoming: 'Upcoming',
            medication: 'Medication',
            appointment: 'Appointment',
            vaccination: 'Vaccination',
            checkup: 'Check-up',
            other: 'Other',
            delete: 'Delete',
        },
        si: {
            title: 'මතක් කිරීම්',
            addReminder: 'එක් කරන්න',
            noReminders: 'සියල්ල යාවත්කාලීනයි! ඉදිරි මතක් කිරීම් නැත.',
            newReminder: 'නව මතක් කිරීම',
            whatRemind: 'අපි ඔබට මොනවද මතක් කළ යුතුද?',
            descriptionLabel: 'විස්තරය (විකල්ප)',
            dateTime: 'දිනය සහ වේලාව',
            categoryLabel: 'කාණ්ඩය',
            setReminder: 'මතක් කිරීම සකසන්න',
            cancel: 'අවලංගු',
            overdue: 'ප්‍රමාද වූ',
            upcoming: 'ඉදිරි',
            medication: 'ඖෂධ',
            appointment: 'වෙදවරු හමුව',
            vaccination: 'එන්නත',
            checkup: 'පරීක්ෂණ',
            other: 'වෙනත්',
            delete: 'මකන්න',
        },
        ta: {
            title: 'நினைவூட்டல்கள்',
            addReminder: 'சேர்க்க',
            noReminders: 'எல்லாம் புதுப்பித்தது! வரவிருக்கும் நினைவூட்டல்கள் இல்லை.',
            newReminder: 'புதிய நினைவூட்டல்',
            whatRemind: 'என்ன நினைவூட்ட வேண்டும்?',
            descriptionLabel: 'விவரம் (விருப்ப)',
            dateTime: 'தேதி & நேரம்',
            categoryLabel: 'வகை',
            setReminder: 'நினைவூட்டல் அமை',
            cancel: 'ரத்து',
            overdue: 'காலாவதியானவை',
            upcoming: 'வரவிருக்கும்',
            medication: 'மருந்து',
            appointment: 'சந்திப்பு',
            vaccination: 'தடுப்பூசி',
            checkup: 'பரிசோதனை',
            other: 'மற்றவை',
            delete: 'நீக்கு',
        },
    }[language];

    const categoryNames: Record<ReminderCategory, string> = {
        medication: t.medication,
        appointment: t.appointment,
        vaccination: t.vaccination,
        checkup: t.checkup,
        other: t.other,
    };

    const handleOpen = () => {
        setEditingReminder(null);
        setTitle('');
        setDescription('');
        setTime(new Date().toISOString().slice(0, 16));
        setCategory('medication');
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        setEditingReminder(null);
    };

    const handleSubmit = () => {
        if (!title.trim()) return;
        if (editingReminder) {
            updateReminder(editingReminder.id, {
                title,
                description,
                time: new Date(time).getTime(),
                category,
                priority: new Date(time).getTime(),
            });
        } else {
            addReminder({
                id: Math.random().toString(36).substr(2, 9),
                title,
                description,
                time: new Date(time).getTime(),
                category,
                priority: new Date(time).getTime(),
            });
        }
        handleClose();
    };

    const handleEdit = (reminder: Reminder) => {
        setEditingReminder(reminder);
        setTitle(reminder.title);
        setDescription(reminder.description || '');
        setTime(new Date(reminder.time).toISOString().slice(0, 16));
        setCategory(reminder.category || 'other');
        setOpen(true);
    };

    const reminderList = reminders.toArray();

    // Split into overdue and upcoming
    const { overdueList, upcomingList } = useMemo(() => {
        const now = Date.now();
        const overdue = reminderList.filter(r => r.time < now).sort((a, b) => b.time - a.time);
        const upcoming = reminderList.filter(r => r.time >= now).sort((a, b) => a.time - b.time);
        return { overdueList: overdue, upcomingList: upcoming };
    }, [reminderList]);

    const renderReminder = (reminder: Reminder) => {
        const urgency = getUrgency(reminder.time);
        const catConfig = CATEGORY_CONFIG[reminder.category || 'other'];

        return (
            <Paper key={reminder.id} sx={{
                p: 2, borderRadius: 2,
                borderLeft: `4px solid ${catConfig.color}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateX(4px)', boxShadow: 3 },
                opacity: urgency.label === 'Overdue' ? 0.75 : 1,
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flex: 1 }}>
                        <Avatar sx={{
                            bgcolor: `${catConfig.color}18`,
                            width: 40, height: 40,
                        }}>
                            {React.cloneElement(catConfig.icon as React.ReactElement<any>, { sx: { color: catConfig.color, fontSize: 22 } })}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography fontWeight={600} fontSize="0.95rem">{reminder.title}</Typography>
                            {reminder.description && (
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.25 }}>{reminder.description}</Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Chip
                                    label={categoryNames[reminder.category || 'other']}
                                    size="small"
                                    variant="outlined"
                                    sx={{ borderColor: catConfig.color, color: catConfig.color, fontWeight: 600, fontSize: '0.7rem' }}
                                />
                                <Typography variant="caption" color="textSecondary">
                                    {new Date(reminder.time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={urgency.label} size="small" color={urgency.color} variant="filled"
                            sx={{ fontWeight: 600, minWidth: 70, justifyContent: 'center' }} />
                        <IconButton size="small" onClick={() => handleEdit(reminder)}
                            sx={{ color: '#1565C0', '&:hover': { bgcolor: '#E3F2FD' } }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => deleteReminderById(reminder.id)}
                            sx={{ '&:hover': { bgcolor: '#FFEBEE' } }}>
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            </Paper>
        );
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                    {t.title}
                </Typography>
                <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleOpen}
                    sx={{ borderRadius: 8, px: 3, background: 'linear-gradient(135deg, #43A047 0%, #66BB6A 100%)', boxShadow: '0 4px 15px rgba(67,160,71,0.3)' }}>
                    {t.addReminder}
                </Button>
            </Box>

            {reminderList.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px dashed #ccc' }}>
                    <NotificationsActiveIcon sx={{ fontSize: 56, color: '#ccc', mb: 1 }} />
                    <Typography color="textSecondary" fontSize="1.1rem">{t.noReminders}</Typography>
                </Paper>
            ) : (
                <Box>
                    {/* Overdue Section */}
                    {overdueList.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <WarningAmberIcon sx={{ color: '#c62828' }} />
                                <Typography variant="h6" fontWeight={600} color="error">
                                    {t.overdue} ({overdueList.length})
                                </Typography>
                            </Box>
                            <Stack spacing={1.5}>
                                {overdueList.map(renderReminder)}
                            </Stack>
                        </Box>
                    )}

                    {/* Upcoming Section */}
                    {upcomingList.length > 0 && (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <NotificationsActiveIcon sx={{ color: '#43A047' }} />
                                <Typography variant="h6" fontWeight={600} color="secondary">
                                    {t.upcoming} ({upcomingList.length})
                                </Typography>
                            </Box>
                            <Stack spacing={1.5}>
                                {upcomingList.map(renderReminder)}
                            </Stack>
                        </Box>
                    )}
                </Box>
            )}

            {/* Add Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, color: 'secondary.main' }}>{editingReminder ? (language === 'en' ? 'Edit Reminder' : language === 'si' ? 'මතක් කිරීම සංස්කරණය' : 'நினைவூட்டலை திருத்து') : t.newReminder}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            label={t.whatRemind}
                            fullWidth
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <TextField
                            label={t.descriptionLabel}
                            fullWidth
                            multiline
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <TextField
                            label={t.dateTime}
                            type="datetime-local"
                            fullWidth
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />

                        {/* Category Selector */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>{t.categoryLabel}</Typography>
                            <ToggleButtonGroup
                                value={category}
                                exclusive
                                onChange={(_, val) => val && setCategory(val)}
                                fullWidth
                                size="small"
                            >
                                {(Object.keys(CATEGORY_CONFIG) as ReminderCategory[]).map((cat) => (
                                    <ToggleButton key={cat} value={cat} sx={{
                                        textTransform: 'none', fontSize: '0.75rem', fontWeight: 600,
                                        '&.Mui-selected': { bgcolor: `${CATEGORY_CONFIG[cat].color}18`, color: CATEGORY_CONFIG[cat].color, borderColor: CATEGORY_CONFIG[cat].color },
                                    }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                                            <span>{CATEGORY_CONFIG[cat].emoji}</span>
                                            <span>{categoryNames[cat]}</span>
                                        </Box>
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose}>{t.cancel}</Button>
                    <Button onClick={handleSubmit} variant="contained" color="secondary"
                        sx={{ borderRadius: 6, px: 4, background: 'linear-gradient(135deg, #43A047 0%, #66BB6A 100%)' }}>
                        {editingReminder ? (language === 'en' ? 'Update' : language === 'si' ? 'යාවත්කාලීන' : 'புதுப்பிக்கவும்') : t.setReminder}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
