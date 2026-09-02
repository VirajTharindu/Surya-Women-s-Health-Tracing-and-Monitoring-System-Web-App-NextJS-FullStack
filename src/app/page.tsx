'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Container, Box, Typography, Grid, Paper, Tabs, Tab, AppBar, Toolbar,
    Avatar, CircularProgress
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

import ChildCareIcon from '@mui/icons-material/ChildCare';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import FavoriteIcon from '@mui/icons-material/Favorite';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

import LanguageSwitcher from '@/components/LanguageSwitcher';
import dynamic from 'next/dynamic';

const MenstrualTracker = dynamic(() => import('@/components/MenstrualTracker'), { ssr: false });
const Reminders = dynamic(() => import('@/components/Reminders'), { ssr: false });
const AwarenessContent = dynamic(() => import('@/components/AwarenessContent'), { ssr: false });
const VitalLogger = dynamic(() => import('@/components/VitalLogger'), { ssr: false });
const PinkBook = dynamic(() => import('@/components/PinkBook'), { ssr: false });
const HealthCharts = dynamic(() => import('@/components/HealthCharts'), { ssr: false });
const UserProfile = dynamic(() => import('@/components/UserProfile'), { ssr: false });
const EmergencyReferral = dynamic(() => import('@/components/EmergencyReferral'), { ssr: false });
const ResourceAllocation = dynamic(() => import('@/components/ResourceAllocation'), { ssr: false });

import { useHealthStore } from '@/store/useHealthStore';

export default function Home() {
    const { status } = useSession();
    const router = useRouter();
    const [tabValue, setTabValue] = useState(0);
    const { language, userProfile, getCurrentCyclePhase, getNextPeriodDate, getVitalLogs, reminders, fetchInitialData } = useHealthStore();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchInitialData();
        }
    }, [status, router, fetchInitialData]);

    if (status === 'loading') {
        return (
            <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const labels = {
        en: { home: 'Home', tracker: 'Tracker', vitals: 'Vitals', pinkbook: 'Pink Book', awareness: 'Awareness', reminders: 'Reminders', profile: 'Profile', network: 'Referrals', pharmacy: 'Pharmacy' },
        si: { home: 'මුල් පිටුව', tracker: 'සටහන', vitals: 'දර්ශක', pinkbook: 'රෝස පොත', awareness: 'දැනුවත්භාවය', reminders: 'මතක් කිරීම්', profile: 'පැතිකඩ', network: 'යොමු කිරීම්', pharmacy: 'ඖෂධ' },
        ta: { home: 'முகப்பு', tracker: 'கண்காணிப்பு', vitals: 'அறிகுறிகள்', pinkbook: 'புத்தகம்', awareness: 'விழிப்புணர்வு', reminders: 'நினைவூட்டல்கள்', profile: 'சுயவிவரம்', network: 'பரிந்துரைகள்', pharmacy: 'மருந்து' }
    }[language];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return language === 'en' ? 'Good Morning' : language === 'si' ? 'සුභ උදෑසනක්' : 'காலை வணக்கம்';
        if (hour < 18) return language === 'en' ? 'Good Afternoon' : language === 'si' ? 'සුභ දහවලක්' : 'மதிய வணக்கம்';
        return language === 'en' ? 'Good Evening' : language === 'si' ? 'සුභ සන්ධ්‍යාවක්' : 'மாலை வணக்கம்';
    };

    // Health Summary Data
    const cyclePhase = getCurrentCyclePhase();
    const nextPeriod = getNextPeriodDate();
    const daysToNext = nextPeriod ? Math.max(0, Math.ceil((nextPeriod.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
    
    const bpLogs = getVitalLogs('bp');
    const lastBp = bpLogs.length > 0 ? bpLogs[bpLogs.length - 1] : null;

    // Include both overdue and upcoming reminders; the first one is the most urgent.
    const allActiveReminders = reminders.toArray().sort((a, b) => a.time - b.time);
    const nextReminder = allActiveReminders.length > 0 ? allActiveReminders[0] : null;

    const summaryLabels = {
        en: { cycle: 'Cycle Phase', period: 'Next Period', bp: 'Last BP', reminder: 'Next Reminder', days: 'days' },
        si: { cycle: 'චක්‍ර අවධිය', period: 'ඊළඟ ඔසප්', bp: 'අවසාන BP', reminder: 'ඊළඟ මතක් කිරීම', days: 'දින' },
        ta: { cycle: 'சுழற்சி நிலை', period: 'அடுத்த மாதவிடாய்', bp: 'கடைசி BP', reminder: 'அடுத்த நினைவூட்டல்', days: 'நாட்கள்' }
    }[language];

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#F7F9FB', pb: 12 }}>
            <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #eee', bgcolor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontWeight: 700, boxShadow: '0 2px 8px rgba(216,27,96,0.3)' }}>
                            {userProfile.name.charAt(0)}
                        </Avatar>
                        <Typography variant="h5" component="div" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: -0.5 }}>
                            Suriya
                        </Typography>
                    </Box>
                    <LanguageSwitcher />
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ mt: 3 }}>
                {tabValue === 0 && (
                    <Box>
                        {/* Personalized Greeting */}
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WbSunnyIcon sx={{ color: '#FFB300', fontSize: 28 }} />
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                {getGreeting()}, {userProfile.name.split(' ')[0]}!
                            </Typography>
                        </Box>

                        {/* Health Summary Strip */}
                        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, mb: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
                            <Paper sx={{ p: 2, borderRadius: 3, minWidth: 140, flexShrink: 0, border: '1px solid #f0f0f0', borderTop: `4px solid ${cyclePhase.color}` }}>
                                <Typography variant="caption" color="textSecondary" fontWeight={600}>{summaryLabels.cycle}</Typography>
                                <Typography variant="h6" fontWeight={700} sx={{ color: cyclePhase.color, mt: 0.5 }}>{cyclePhase.phase}</Typography>
                            </Paper>
                            
                            <Paper sx={{ p: 2, borderRadius: 3, minWidth: 140, flexShrink: 0, border: '1px solid #f0f0f0', borderTop: '4px solid #D81B60' }}>
                                <Typography variant="caption" color="textSecondary" fontWeight={600}>{summaryLabels.period}</Typography>
                                <Typography variant="h6" fontWeight={700} sx={{ color: '#D81B60', mt: 0.5 }}>
                                    {daysToNext !== null ? `In ${daysToNext} ${summaryLabels.days}` : '—'}
                                </Typography>
                            </Paper>
                            
                            <Paper sx={{ p: 2, borderRadius: 3, minWidth: 140, flexShrink: 0, border: '1px solid #f0f0f0', borderTop: '4px solid #1565C0' }}>
                                <Typography variant="caption" color="textSecondary" fontWeight={600}>{summaryLabels.bp}</Typography>
                                <Typography variant="h6" fontWeight={700} sx={{ color: '#1565C0', mt: 0.5 }}>
                                    {lastBp ? `${lastBp.value.systolic}/${lastBp.value.diastolic}` : '—'}
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: 2, borderRadius: 3, minWidth: 160, flexShrink: 0, border: '1px solid #f0f0f0', borderTop: '4px solid #43A047' }}>
                                <Typography variant="caption" color="textSecondary" fontWeight={600}>{summaryLabels.reminder}</Typography>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#43A047', mt: 0.5 }} noWrap>
                                    {nextReminder ? nextReminder.title : '—'}
                                </Typography>
                            </Paper>
                        </Box>

                        <HealthCharts />

                        {/* Quick Actions Grid */}
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2, mt: 4 }}>
                            {language === 'en' ? 'Quick Actions' : language === 'si' ? 'ඉක්මන් ක්‍රියා' : 'விரைவான செயல்கள்'}
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={4}>
                                <Paper sx={{ 
                                    p: 2.5, textAlign: 'center', cursor: 'pointer', height: '100%', borderRadius: 4,
                                    background: 'linear-gradient(135deg, #FFEFEF 0%, #FFF 100%)',
                                    border: '1px solid #FFE4E4', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }
                                }} onClick={() => setTabValue(1)}>
                                    <Avatar sx={{ bgcolor: '#D81B60', width: 48, height: 48, mx: 'auto', mb: 1.5, boxShadow: '0 4px 10px rgba(216,27,96,0.2)' }}>
                                        <CalendarMonthIcon />
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={700} color="#D81B60">{labels.tracker}</Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={6} sm={4}>
                                <Paper sx={{ 
                                    p: 2.5, textAlign: 'center', cursor: 'pointer', height: '100%', borderRadius: 4,
                                    background: 'linear-gradient(135deg, #F3E5F5 0%, #FFF 100%)',
                                    border: '1px solid #E1BEE7', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }
                                }} onClick={() => setTabValue(2)}>
                                    <Avatar sx={{ bgcolor: '#7B1FA2', width: 48, height: 48, mx: 'auto', mb: 1.5, boxShadow: '0 4px 10px rgba(123,31,162,0.2)' }}>
                                        <FavoriteIcon />
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={700} color="#7B1FA2">{labels.vitals}</Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={6} sm={4}>
                                <Paper sx={{ 
                                    p: 2.5, textAlign: 'center', cursor: 'pointer', height: '100%', borderRadius: 4,
                                    background: 'linear-gradient(135deg, #FCE4EC 0%, #FFF 100%)',
                                    border: '1px solid #F8BBD0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }
                                }} onClick={() => setTabValue(3)}>
                                    <Avatar sx={{ bgcolor: '#EC407A', width: 48, height: 48, mx: 'auto', mb: 1.5, boxShadow: '0 4px 10px rgba(236,64,122,0.2)' }}>
                                        <ChildCareIcon />
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={700} color="#EC407A">{labels.pinkbook}</Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={6} sm={4}>
                                <Paper sx={{ 
                                    p: 2.5, textAlign: 'center', cursor: 'pointer', height: '100%', borderRadius: 4,
                                    background: 'linear-gradient(135deg, #E8F5E9 0%, #FFF 100%)',
                                    border: '1px solid #C8E6C9', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }
                                }} onClick={() => setTabValue(5)}>
                                    <Avatar sx={{ bgcolor: '#43A047', width: 48, height: 48, mx: 'auto', mb: 1.5, boxShadow: '0 4px 10px rgba(67,160,71,0.2)' }}>
                                        <NotificationsActiveIcon />
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={700} color="#43A047">{labels.reminders}</Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={6} sm={4}>
                                <Paper sx={{ 
                                    p: 2.5, textAlign: 'center', cursor: 'pointer', height: '100%', borderRadius: 4,
                                    background: 'linear-gradient(135deg, #FFF3E0 0%, #FFF 100%)',
                                    border: '1px solid #FFE0B2', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }
                                }} onClick={() => setTabValue(4)}>
                                    <Avatar sx={{ bgcolor: '#FF6F00', width: 48, height: 48, mx: 'auto', mb: 1.5, boxShadow: '0 4px 10px rgba(255,111,0,0.2)' }}>
                                        <MenuBookIcon />
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={700} color="#FF6F00">{labels.awareness}</Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={6} sm={4}>
                                <Paper sx={{ 
                                    p: 2.5, textAlign: 'center', cursor: 'pointer', height: '100%', borderRadius: 4,
                                    background: 'linear-gradient(135deg, #E3F2FD 0%, #FFF 100%)',
                                    border: '1px solid #BBDEFB', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }
                                }} onClick={() => setTabValue(7)}>
                                    <Avatar sx={{ bgcolor: '#1565C0', width: 48, height: 48, mx: 'auto', mb: 1.5, boxShadow: '0 4px 10px rgba(21,101,192,0.2)' }}>
                                        <LocalHospitalIcon />
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={700} color="#1565C0">{labels.network}</Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {tabValue === 1 && <MenstrualTracker />}
                {tabValue === 2 && <VitalLogger />}
                {tabValue === 3 && <PinkBook />}
                {tabValue === 4 && <AwarenessContent />}
                {tabValue === 5 && <Reminders />}
                {tabValue === 6 && <UserProfile />}
                {tabValue === 7 && <EmergencyReferral />}
                {tabValue === 8 && <ResourceAllocation />}
            </Container>

            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={16}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper', '& .MuiTab-root': { minWidth: 72, py: 2 } }}
                >
                    <Tab icon={<HealthAndSafetyIcon />} label={labels.home} />
                    <Tab icon={<CalendarMonthIcon />} label={labels.tracker} />
                    <Tab icon={<FavoriteIcon />} label={labels.vitals} />
                    <Tab icon={<ChildCareIcon />} label={labels.pinkbook} />
                    <Tab icon={<MenuBookIcon />} label={labels.awareness} />
                    <Tab icon={<NotificationsActiveIcon />} label={labels.reminders} />
                    <Tab icon={<AccountCircleIcon />} label={labels.profile} />
                </Tabs>
            </Paper>
        </Box>
    );
}
