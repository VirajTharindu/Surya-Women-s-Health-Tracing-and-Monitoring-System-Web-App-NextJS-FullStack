'use client';

import React from 'react';
import {
    Box, Typography, Paper, Avatar, Switch, List, ListItem,
    ListItemText, ListItemSecondaryAction, Divider, Button, ListItemIcon
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useHealthStore } from '@/store/useHealthStore';

export default function UserProfile() {
    const { language, userProfile } = useHealthStore();

    const t = {
        en: {
            title: 'User Profile',
            privacy: 'Privacy First',
            privacyDesc: 'All health data is stored locally on this device.',
            biometric: 'Biometric Lock',
            biometricDesc: 'Enable fingerprint for app access',
            sync: 'Sync with PHI (Midwife)',
            syncDesc: 'Securely share data with clinic field worker',
            logout: 'Logout & Clear Data',
            height: 'Height',
            dob: 'Date of Birth',
        },
        si: {
            title: 'පරිශීලක පැතිකඩ',
            privacy: 'පෞද්ගලිකත්වය පළමුව',
            privacyDesc: 'සියලුම සෞඛ්‍ය දත්ත මෙම උපාංගයේ දේශීයව ගබඩා කර ඇත.',
            biometric: 'ජෛවමිතික අගුල',
            biometricDesc: 'යෙදුමට පිවිසීම සඳහා ඇඟිලි සලකුණු සක්‍රීය කරන්න',
            sync: 'පවුල් සෞඛ්‍ය සේවා නිලධාරිනි සමග සමමුහුර්ත කරන්න',
            syncDesc: 'සායන ක්ෂේත්‍ර සේවකයා සමඟ දත්ත ආරක්ෂිතව බෙදා ගන්න',
            logout: 'ඉවත්වීම සහ දත්ත මකා දැමීම',
            height: 'උස',
            dob: 'උපන් දිනය',
        },
        ta: {
            title: 'பயனர் சுயவிவரம்',
            privacy: 'தனியுரிமை முதலில்',
            privacyDesc: 'அனைத்து சுகாதார தரவுகளும் இந்த சாதனத்தில் உள்ளூரிலேயே சேமிக்கப்படுகின்றன.',
            biometric: 'பயோமெட்ரிக் பூட்டு',
            biometricDesc: 'பயன்பாட்டு அணுகலுக்கு கைரேகையை இயக்கு',
            sync: 'குடும்ப நலப் பணியாளருடன் ஒத்திசை (PHI)',
            syncDesc: 'கிளினிக் களப் பணியாளருடன் தரவை பாதுகாப்பாக பகிரவும்',
            logout: 'வெளியேறு & தரவை அழி',
            height: 'உயரம்',
            dob: 'பிறந்த தேதி',
        },
    }[language];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.light', fontSize: '2rem' }}>
                    {userProfile.name.charAt(0)}
                </Avatar>
                <Typography variant="h5" fontWeight={700}>{userProfile.name}</Typography>
                <Typography variant="body2" color="textSecondary">{userProfile.location}</Typography>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                        <strong>{t.dob}:</strong> {userProfile.dob}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        <strong>{t.height}:</strong> {userProfile.heightCm} cm
                    </Typography>
                </Box>
            </Box>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                {language === 'en' ? 'Settings' : language === 'si' ? 'සැකසුම්' : 'அமைப்புகள்'}
            </Typography>

            <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden', border: '1px solid #eee' }}>
                <List>
                    <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                            <LockIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary={<Typography fontWeight={600}>{t.privacy}</Typography>}
                            secondary={t.privacyDesc}
                        />
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ py: 2 }}>
                        <ListItemText 
                            primary={<Typography fontWeight={600}>{t.biometric}</Typography>} 
                            secondary={t.biometricDesc} 
                        />
                        <ListItemSecondaryAction>
                            <Switch defaultChecked color="primary" />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                    <ListItem sx={{ py: 2 }}>
                        <ListItemText 
                            primary={<Typography fontWeight={600}>{t.sync}</Typography>} 
                            secondary={t.syncDesc} 
                        />
                        <ListItemSecondaryAction>
                            <Switch color="primary" />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </Paper>

            <Button variant="outlined" fullWidth color="error" sx={{ mt: 4, borderRadius: 6, py: 1.5, fontWeight: 700 }}>
                {t.logout}
            </Button>
        </Box>
    );
}

