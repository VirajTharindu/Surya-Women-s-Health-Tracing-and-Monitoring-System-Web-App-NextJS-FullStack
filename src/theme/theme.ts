'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#D81B60', // A warm, pinkish-red (inspired by some Sri Lankan elements and women's health associations)
            light: '#FF5C8D',
            dark: '#A00037',
        },
        secondary: {
            main: '#43A047', // A healthy green for vitals and growth
            light: '#76D275',
            dark: '#00701A',
        },
        background: {
            default: '#FDFCFB',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#2D3436',
            secondary: '#636E72',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
        },
        h2: {
            fontWeight: 600,
            fontSize: '2rem',
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    padding: '8px 24px',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                },
            },
        },
    },
});

export default theme;
