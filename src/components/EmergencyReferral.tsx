'use client';

import React from 'react';
import { Box, Typography, Paper, Grid, Chip, Button, Divider } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HotelIcon from '@mui/icons-material/Hotel';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import { useHealthStore } from '@/store/useHealthStore';

const HOSPITALS = [
    {
        id: 1,
        name: 'Colombo South Teaching Hospital',
        distance: '4.2 km',
        beds: 12,
        incubators: 3,
        type: 'Teaching Hospital',
        status: 'Available',
        contact: '011-281-1111'
    },
    {
        id: 2,
        name: 'Castle Street Hospital for Women',
        distance: '6.8 km',
        beds: 5,
        incubators: 0,
        type: 'Maternity Specialist',
        status: 'High Capacity',
        contact: '011-269-6231'
    },
    {
        id: 3,
        name: 'De Soysa Hospital for Women',
        distance: '7.5 km',
        beds: 18,
        incubators: 5,
        type: 'Maternity Specialist',
        status: 'Available',
        contact: '011-269-6224'
    },
    {
        id: 4,
        name: 'Lanka Hospitals',
        distance: '5.1 km',
        beds: 8,
        incubators: 2,
        type: 'Private',
        status: 'Available',
        contact: '011-543-0000'
    }
];

export default function EmergencyReferral() {
    const { language } = useHealthStore();

    const t = {
        en: {
            title: 'Emergency & Referral System',
            desc: 'Find nearby hospitals with available maternity beds and neonatal incubators for urgent transfers.',
            beds: 'Maternity Beds',
            incubators: 'Incubators',
            call: 'Call',
            transfer: 'Initiate Transfer',
            statusAvail: 'Available',
            statusHigh: 'High Capacity',
            distance: 'Distance'
        },
        si: {
            title: 'හදිසි සහ යොමු කිරීමේ පද්ධතිය',
            desc: 'හදිසි මාරු කිරීම් සඳහා මාතෘ ඇඳන් සහ ළදරු ඉන්කියුබේටර් සහිත අසල ඇති රෝහල් සොයා ගන්න.',
            beds: 'මාතෘ ඇඳන්',
            incubators: 'ඉන්කියුබේටර්',
            call: 'අමතන්න',
            transfer: 'මාරු කිරීම අරඹන්න',
            statusAvail: 'ලබා ගත හැක',
            statusHigh: 'ඉහළ ධාරිතාවක්',
            distance: 'දුර'
        },
        ta: {
            title: 'அவசர மற்றும் பரிந்துரை அமைப்பு',
            desc: 'அவசர இடமாற்றங்களுக்கு மகப்பேறு படுக்கைகள் மற்றும் பிறந்த குழந்தை இன்குபேட்டர்கள் உள்ள அருகிலுள்ள மருத்துவமனைகளைக் கண்டறியவும்.',
            beds: 'மகப்பேறு படுக்கைகள்',
            incubators: 'இன்குபேட்டர்கள்',
            call: 'அழைக்கவும்',
            transfer: 'இடமாற்றத்தை தொடங்கு',
            statusAvail: 'கிடைக்கிறது',
            statusHigh: 'அதிக கொள்ளளவு',
            distance: 'தூரம்'
        },
    }[language];

    const getStatusColor = (status: string) => {
        if (status === 'Available') return 'success';
        if (status === 'High Capacity') return 'warning';
        return 'error';
    };

    const getStatusLabel = (status: string) => {
        if (status === 'Available') return t.statusAvail;
        if (status === 'High Capacity') return t.statusHigh;
        return status;
    };

    return (
        <Box sx={{ p: { xs: 1, md: 3 } }}>
            <Typography variant="h4" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                <LocalHospitalIcon fontSize="large" />
                {t.title}
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                {t.desc}
            </Typography>

            <Grid container spacing={3}>
                {HOSPITALS.map((hospital) => (
                    <Grid item xs={12} md={6} key={hospital.id}>
                        <Paper sx={{ p: 3, borderRadius: 3, borderLeft: '6px solid', borderColor: hospital.status === 'Available' ? '#4CAF50' : '#FF9800', transition: '0.3s', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.1)' } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                    <Typography variant="h6" fontWeight={700} sx={{ color: '#333' }}>
                                        {hospital.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                        {hospital.type} • {t.distance}: {hospital.distance}
                                    </Typography>
                                </Box>
                                <Chip 
                                    label={getStatusLabel(hospital.status)} 
                                    color={getStatusColor(hospital.status) as any} 
                                    size="small" 
                                    sx={{ fontWeight: 600, borderRadius: 1 }} 
                                />
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#F3E5F5', borderRadius: 2 }}>
                                        <HotelIcon sx={{ color: '#7B1FA2' }} />
                                        <Box>
                                            <Typography variant="h5" fontWeight={700} color="#7B1FA2" lineHeight={1}>
                                                {hospital.beds}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" fontWeight={600}>
                                                {t.beds}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#E3F2FD', borderRadius: 2 }}>
                                        <ChildCareIcon sx={{ color: '#1565C0' }} />
                                        <Box>
                                            <Typography variant="h5" fontWeight={700} color="#1565C0" lineHeight={1}>
                                                {hospital.incubators}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" fontWeight={600}>
                                                {t.incubators}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    color="primary" 
                                    startIcon={<PhoneInTalkIcon />}
                                    sx={{ flex: 1, borderRadius: 2, fontWeight: 600, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                                >
                                    {t.call}
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    startIcon={<DirectionsCarIcon />}
                                    sx={{ flex: 1, borderRadius: 2, fontWeight: 600, boxShadow: '0 4px 12px rgba(216,27,96,0.3)' }}
                                >
                                    {t.transfer}
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
