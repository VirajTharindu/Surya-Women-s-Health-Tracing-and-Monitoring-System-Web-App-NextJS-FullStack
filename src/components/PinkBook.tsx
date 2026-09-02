'use client';

import React, { useState } from 'react';
import {
    Box, Typography, Paper, Grid,
    Avatar, LinearProgress, Tabs, Tab, Chip, TextField,
    Button, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Slider
} from '@mui/material';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PregnantWomanIcon from '@mui/icons-material/PregnantWoman';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { useHealthStore } from '@/store/useHealthStore';

export default function PinkBook() {
    const { language, pinkBookData, updatePinkBookData, toggleVaccination, toggleANCVisit, addGrowthRecord } = useHealthStore();
    const [activeTab, setActiveTab] = useState(0);
    const [editing, setEditing] = useState(false);

    // Growth record form
    const [growthDate, setGrowthDate] = useState(new Date().toISOString().split('T')[0]);
    const [growthWeight, setGrowthWeight] = useState('');
    const [growthHeight, setGrowthHeight] = useState('');

    const t = {
        en: {
            title: 'Digital Pink Book',
            subtitle: 'Sri Lanka — Mother & Child Health Record',
            maternal: 'Maternal Care',
            child: 'Child Health',
            growth: 'Growth',
            regNo: 'Registration Number',
            clinic: 'Registered Clinic',
            edd: 'Expected Delivery Date',
            ttDose: 'Tetanus Toxoid',
            dose1: 'Dose 1',
            dose2: 'Dose 2',
            ironAdherence: 'Iron Tablet Adherence',
            ancVisits: 'Antenatal Care Visits',
            visit: 'Visit',
            completed: 'Completed',
            pending: 'Pending',
            edit: 'Edit',
            save: 'Save',
            vaccinations: 'Vaccination Schedule',
            vaccine: 'Vaccine',
            age: 'Age',
            status: 'Status',
            done: 'Done',
            childName: 'Child Name',
            childDob: 'Date of Birth',
            date: 'Date',
            weight: 'Weight (kg)',
            height: 'Height (cm)',
            addRecord: 'Add Record',
            noRecords: 'No growth records yet.',
        },
        si: {
            title: 'ඩිජිටල් රෝස පොත',
            subtitle: 'ශ්‍රී ලංකාව — මව් හා ළමා සෞඛ්‍ය වාර්තාව',
            maternal: 'මාතෘ සත්කාර',
            child: 'ළමා සෞඛ්‍ය',
            growth: 'වර්ධනය',
            regNo: 'ලියාපදිංචි අංකය',
            clinic: 'ලියාපදිංචි සායනය',
            edd: 'අපේක්ෂිත දින',
            ttDose: 'ටෙටනස් ටොක්සොයිඩ්',
            dose1: '1 වන මාත්‍රාව',
            dose2: '2 වන මාත්‍රාව',
            ironAdherence: 'යකඩ පෙති පිළිපැදීම',
            ancVisits: 'ප්‍රසව පෙර සායන පැමිණීම',
            visit: 'සංචාරය',
            completed: 'සම්පූර්ණයි',
            pending: 'ඉතිරිව ඇත',
            edit: 'සංස්කරණය',
            save: 'සුරකින්න',
            vaccinations: 'එන්නත් කාලසටහන',
            vaccine: 'එන්නත',
            age: 'වයස',
            status: 'තත්ත්වය',
            done: 'කලා',
            childName: 'ළමා නම',
            childDob: 'උපන් දිනය',
            date: 'දිනය',
            weight: 'බර (kg)',
            height: 'උස (cm)',
            addRecord: 'එකතු කරන්න',
            noRecords: 'තවමත් වර්ධන සටහන් නැත.',
        },
        ta: {
            title: 'டிஜிட்டல் இளஞ்சிவப்பு புத்தகம்',
            subtitle: 'இலங்கை — தாய் & குழந்தை சுகாதார பதிவு',
            maternal: 'தாய்வழி பராமரிப்பு',
            child: 'குழந்தை சுகாதாரம்',
            growth: 'வளர்ச்சி',
            regNo: 'பதிவு எண்',
            clinic: 'பதிவு செய்யப்பட்ட மருத்துவமனை',
            edd: 'எதிர்பார்க்கப்படும் தேதி',
            ttDose: 'டெட்டனஸ் டாக்ஸாய்டு',
            dose1: 'தவணை 1',
            dose2: 'தவணை 2',
            ironAdherence: 'இரும்பு மாத்திரை இணக்கம்',
            ancVisits: 'மகப்பேறுக்கு முந்தைய பார்வைகள்',
            visit: 'பார்வை',
            completed: 'நிறைவு',
            pending: 'நிலுவை',
            edit: 'திருத்து',
            save: 'சேமி',
            vaccinations: 'தடுப்பூசி அட்டவணை',
            vaccine: 'தடுப்பூசி',
            age: 'வயது',
            status: 'நிலை',
            done: 'முடிந்தது',
            childName: 'குழந்தை பெயர்',
            childDob: 'பிறந்த தேதி',
            date: 'தேதி',
            weight: 'எடை (kg)',
            height: 'உயரம் (cm)',
            addRecord: 'பதிவு சேர்',
            noRecords: 'இதுவரை வளர்ச்சிப் பதிவுகள் இல்லை.',
        },
    }[language];

    const completedANC = pinkBookData.ancVisits.filter(v => v.completed).length;
    const completedVax = pinkBookData.vaccinations.filter(v => v.completed).length;

    const handleAddGrowth = () => {
        const w = parseFloat(growthWeight);
        const h = parseFloat(growthHeight);
        if (isNaN(w) || isNaN(h)) return;
        addGrowthRecord({ date: growthDate, weightKg: w, heightCm: h });
        setGrowthWeight('');
        setGrowthHeight('');
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{
                    bgcolor: '#F48FB1', width: 56, height: 56,
                    background: 'linear-gradient(135deg, #F48FB1 0%, #EC407A 100%)',
                    boxShadow: '0 4px 15px rgba(244,143,177,0.4)',
                }}>
                    <ChildCareIcon fontSize="large" />
                </Avatar>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{t.title}</Typography>
                    <Typography variant="subtitle1" color="textSecondary">{t.subtitle}</Typography>
                </Box>
            </Box>

            {/* Progress Overview */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, border: '1px solid #F8BBD033', background: 'linear-gradient(135deg, #FCE4EC 0%, #fff 100%)' }}>
                        <Typography variant="h4" fontWeight={700} color="primary">{completedANC}/8</Typography>
                        <Typography variant="caption" color="textSecondary">{t.ancVisits}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, border: '1px solid #BBDEFB33', background: 'linear-gradient(135deg, #E3F2FD 0%, #fff 100%)' }}>
                        <Typography variant="h4" fontWeight={700} color="#1565C0">{completedVax}/{pinkBookData.vaccinations.length}</Typography>
                        <Typography variant="caption" color="textSecondary">{t.vaccinations}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 3, border: '1px solid #C8E6C933', background: 'linear-gradient(135deg, #E8F5E9 0%, #fff 100%)' }}>
                        <Typography variant="h4" fontWeight={700} color="#43A047">{pinkBookData.ironAdherence}%</Typography>
                        <Typography variant="caption" color="textSecondary">{t.ironAdherence}</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ mb: 3 }}
                textColor="primary" indicatorColor="primary">
                <Tab icon={<PregnantWomanIcon />} label={t.maternal} sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab icon={<VaccinesIcon />} label={t.child} sx={{ textTransform: 'none', fontWeight: 600 }} />
                <Tab icon={<MonitorWeightIcon />} label={t.growth} sx={{ textTransform: 'none', fontWeight: 600 }} />
            </Tabs>

            {/* Maternal Care Tab */}
            {activeTab === 0 && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={editing ? <SaveIcon /> : <EditIcon />}
                            onClick={() => setEditing(!editing)}
                            sx={{ borderRadius: 6 }}
                        >
                            {editing ? t.save : t.edit}
                        </Button>
                    </Box>

                    <Paper sx={{ p: 3, borderRadius: 3, borderLeft: '6px solid #F48FB1', mb: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label={t.regNo}
                                    fullWidth
                                    size="small"
                                    value={pinkBookData.registrationNumber}
                                    onChange={(e) => updatePinkBookData({ registrationNumber: e.target.value })}
                                    disabled={!editing}
                                    placeholder="TR/2024/001"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label={t.clinic}
                                    fullWidth
                                    size="small"
                                    value={pinkBookData.registeredClinic}
                                    onChange={(e) => updatePinkBookData({ registeredClinic: e.target.value })}
                                    disabled={!editing}
                                    placeholder="Colombo Central Clinic"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label={t.edd}
                                    type="date"
                                    fullWidth
                                    size="small"
                                    value={pinkBookData.edd}
                                    onChange={(e) => updatePinkBookData({ edd: e.target.value })}
                                    disabled={!editing}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* TT Doses */}
                    <Paper sx={{ p: 3, borderRadius: 3, mb: 3, border: '1px solid #f0f0f0' }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>{t.ttDose}</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Paper sx={{
                                    p: 2, borderRadius: 2, textAlign: 'center', cursor: 'pointer',
                                    bgcolor: pinkBookData.ttDose1 ? '#E8F5E9' : '#fff',
                                    border: pinkBookData.ttDose1 ? '2px solid #43A047' : '1px solid #e0e0e0',
                                    transition: 'all 0.2s',
                                }} onClick={() => updatePinkBookData({ ttDose1: !pinkBookData.ttDose1, ttDose1Date: !pinkBookData.ttDose1 ? new Date().toISOString().split('T')[0] : '' })}>
                                    {pinkBookData.ttDose1 ? <CheckCircleIcon sx={{ color: '#43A047', fontSize: 32 }} /> : <RadioButtonUncheckedIcon sx={{ color: '#ccc', fontSize: 32 }} />}
                                    <Typography fontWeight={600}>{t.dose1}</Typography>
                                    {pinkBookData.ttDose1Date && <Typography variant="caption" color="textSecondary">{pinkBookData.ttDose1Date}</Typography>}
                                </Paper>
                            </Grid>
                            <Grid item xs={6}>
                                <Paper sx={{
                                    p: 2, borderRadius: 2, textAlign: 'center', cursor: 'pointer',
                                    bgcolor: pinkBookData.ttDose2 ? '#E8F5E9' : '#fff',
                                    border: pinkBookData.ttDose2 ? '2px solid #43A047' : '1px solid #e0e0e0',
                                    transition: 'all 0.2s',
                                }} onClick={() => updatePinkBookData({ ttDose2: !pinkBookData.ttDose2, ttDose2Date: !pinkBookData.ttDose2 ? new Date().toISOString().split('T')[0] : '' })}>
                                    {pinkBookData.ttDose2 ? <CheckCircleIcon sx={{ color: '#43A047', fontSize: 32 }} /> : <RadioButtonUncheckedIcon sx={{ color: '#ccc', fontSize: 32 }} />}
                                    <Typography fontWeight={600}>{t.dose2}</Typography>
                                    {pinkBookData.ttDose2Date && <Typography variant="caption" color="textSecondary">{pinkBookData.ttDose2Date}</Typography>}
                                </Paper>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Iron Adherence */}
                    <Paper sx={{ p: 3, borderRadius: 3, mb: 3, border: '1px solid #f0f0f0' }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>{t.ironAdherence}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Slider
                                value={pinkBookData.ironAdherence}
                                onChange={(_, val) => updatePinkBookData({ ironAdherence: val as number })}
                                min={0} max={100} step={5}
                                sx={{ flexGrow: 1, color: pinkBookData.ironAdherence >= 80 ? '#43A047' : pinkBookData.ironAdherence >= 50 ? '#FF6F00' : '#D81B60' }}
                            />
                            <Typography variant="h5" fontWeight={700} sx={{
                                color: pinkBookData.ironAdherence >= 80 ? '#43A047' : pinkBookData.ironAdherence >= 50 ? '#FF6F00' : '#D81B60',
                                minWidth: 60, textAlign: 'right',
                            }}>
                                {pinkBookData.ironAdherence}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={pinkBookData.ironAdherence}
                            sx={{
                                mt: 1, height: 10, borderRadius: 5,
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: pinkBookData.ironAdherence >= 80 ? '#43A047' : pinkBookData.ironAdherence >= 50 ? '#FF6F00' : '#D81B60',
                                    borderRadius: 5,
                                },
                            }}
                        />
                    </Paper>

                    {/* ANC Visits */}
                    <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #f0f0f0' }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>{t.ancVisits}</Typography>
                        <Grid container spacing={1}>
                            {pinkBookData.ancVisits.map((visit) => (
                                <Grid item xs={6} sm={3} key={visit.visitNumber}>
                                    <Paper sx={{
                                        p: 1.5, textAlign: 'center', cursor: 'pointer', borderRadius: 2,
                                        bgcolor: visit.completed ? '#E8F5E9' : '#fff',
                                        border: visit.completed ? '2px solid #43A047' : '1px solid #e0e0e0',
                                        transition: 'all 0.2s',
                                        '&:hover': { boxShadow: 2 },
                                    }} onClick={() => toggleANCVisit(visit.visitNumber)}>
                                        {visit.completed
                                            ? <CheckCircleIcon sx={{ color: '#43A047' }} />
                                            : <RadioButtonUncheckedIcon sx={{ color: '#ccc' }} />
                                        }
                                        <Typography variant="body2" fontWeight={600}>{t.visit} {visit.visitNumber}</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {visit.completed ? t.completed : t.pending}
                                        </Typography>
                                        {visit.date && <Typography variant="caption" display="block" color="textSecondary">{visit.date}</Typography>}
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Box>
            )}

            {/* Child Health — Vaccinations */}
            {activeTab === 1 && (
                <Box>
                    <Paper sx={{ p: 2, borderRadius: 3, mb: 3, border: '1px solid #f0f0f0' }}>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label={t.childName}
                                    fullWidth
                                    size="small"
                                    value={pinkBookData.childName}
                                    onChange={(e) => updatePinkBookData({ childName: e.target.value })}
                                    placeholder="Baby's name"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label={t.childDob}
                                    type="date"
                                    fullWidth
                                    size="small"
                                    value={pinkBookData.childDob}
                                    onChange={(e) => updatePinkBookData({ childDob: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                        <Typography variant="h6" fontWeight={600} sx={{ p: 2, pb: 0 }}>{t.vaccinations}</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>{t.vaccine}</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>{t.age}</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="center">{t.status}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pinkBookData.vaccinations.map((vax) => (
                                        <TableRow key={vax.id} sx={{
                                            bgcolor: vax.completed ? '#E8F5E911' : 'transparent',
                                            transition: 'background 0.2s',
                                        }}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={vax.completed ? 400 : 600}
                                                    sx={{ textDecoration: vax.completed ? 'line-through' : 'none', color: vax.completed ? 'text.secondary' : 'text.primary' }}>
                                                    {vax.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="textSecondary">{vax.ageRange}</Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={vax.completed ? (vax.dateGiven || t.done) : t.pending}
                                                    size="small"
                                                    color={vax.completed ? 'success' : 'default'}
                                                    variant={vax.completed ? 'filled' : 'outlined'}
                                                    onClick={() => toggleVaccination(vax.id)}
                                                    sx={{ cursor: 'pointer', fontWeight: 600, minWidth: 80 }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            )}

            {/* Growth Monitoring */}
            {activeTab === 2 && (
                <Box>
                    <Paper sx={{ p: 3, borderRadius: 3, mb: 3, border: '1px solid #f0f0f0' }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                            {language === 'en' ? 'Add Growth Record' : language === 'si' ? 'වර්ධන සටහනක් එකතු කරන්න' : 'வளர்ச்சிப் பதிவு சேர்க்க'}
                        </Typography>
                        <Grid container spacing={2} alignItems="flex-end">
                            <Grid item xs={12} sm={3}>
                                <TextField label={t.date} type="date" fullWidth size="small" value={growthDate}
                                    onChange={(e) => setGrowthDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField label={t.weight} type="number" fullWidth size="small" value={growthWeight}
                                    onChange={(e) => setGrowthWeight(e.target.value)} placeholder="3.5"
                                    InputProps={{ inputProps: { step: 0.1, min: 0.5, max: 30 } }} />
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <TextField label={t.height} type="number" fullWidth size="small" value={growthHeight}
                                    onChange={(e) => setGrowthHeight(e.target.value)} placeholder="50"
                                    InputProps={{ inputProps: { step: 0.5, min: 20, max: 120 } }} />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Button variant="contained" fullWidth startIcon={<AddIcon />} onClick={handleAddGrowth}
                                    sx={{ borderRadius: 6, background: 'linear-gradient(135deg, #43A047 0%, #66BB6A 100%)' }}>
                                    {t.addRecord}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {pinkBookData.growthRecords.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #ccc' }}>
                            <MonitorWeightIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                            <Typography color="textSecondary">{t.noRecords}</Typography>
                        </Paper>
                    ) : (
                        <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>{t.date}</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>{t.weight}</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>{t.height}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {[...pinkBookData.growthRecords].reverse().map((rec, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{new Date(rec.date).toLocaleDateString()}</TableCell>
                                                <TableCell>{rec.weightKg} kg</TableCell>
                                                <TableCell>{rec.heightCm} cm</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}
                </Box>
            )}
        </Box>
    );
}
