'use client';

import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import { useHealthStore } from '@/store/useHealthStore';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useHealthStore();

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newLanguage: 'en' | 'si' | 'ta',
    ) => {
        if (newLanguage !== null) {
            setLanguage(newLanguage);
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
            <ToggleButtonGroup
                color="primary"
                value={language}
                exclusive
                onChange={handleChange}
                aria-label="Language"
                size="small"
            >
                <ToggleButton value="en">English</ToggleButton>
                <ToggleButton value="si">සිංහල</ToggleButton>
                <ToggleButton value="ta">தமிழ்</ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
}
