'use client';

import React, { useState, useMemo } from 'react';
import {
    Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails,
    Chip, Stack, Avatar, Alert, TextField, InputAdornment, IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PregnantWomanIcon from '@mui/icons-material/PregnantWoman';
import HealingIcon from '@mui/icons-material/Healing';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useHealthStore } from '@/store/useHealthStore';
import { HealthTree, TreeNode } from '@/lib/data-structures/Tree';

interface Topic {
    id: string;
    icon: React.ReactNode;
    color: string;
    title: Record<string, string>;
    intro: Record<string, string>;
    facts: Record<string, string[]>;
    didYouKnow: Record<string, string>;
    tips: Record<string, string[]>;
}

const TOPICS: Topic[] = [
    {
        id: 'pregnancy',
        icon: <PregnantWomanIcon />,
        color: '#D81B60',
        title: { en: 'Pregnancy & Antenatal Care', si: 'ගර්භනී සමය සහ ප්‍රසව පෙර සත්කාර', ta: 'கர்ப்பம் & மகப்பேறுக்கு முந்தைய பராமரிப்பு' },
        intro: { en: 'Regular antenatal care is essential for a safe pregnancy...', si: 'ආරක්ෂිත ගර්භනී සමයක් සඳහා...', ta: 'பாதுகாப்பான கர்ப்பத்திற்கு...' },
        facts: { en: ['8 ANC visits recommended', 'Folic acid from first trimester'], si: ['ප්‍රසව පෙර සංචාර 8 නිර්දේශිතයි'], ta: ['8 ANC பார்வைகள் பரிந்துரைக்கப்படுகின்றன'] },
        didYouKnow: { en: 'Sri Lanka has one of the lowest maternal mortality rates in South Asia...', si: 'ශ්‍රී ලංකාව දකුණු ආසියාවේ...', ta: 'இலங்கை தெற்காசியாவில்...' },
        tips: { en: ['Attend all 8 ANC visits on schedule', 'Take iron and folic acid tablets daily as prescribed'], si: ['සියලුම ප්‍රසව පෙර සංචාර 8 නියමිත පරිදි සහභාගී වන්න'], ta: ['திட்டமிட்டபடி அனைத்து 8 ANC பார்வைகளிலும் கலந்துகொள்ளுங்கள்'] },
    },
    {
        id: 'postnatal',
        icon: <ChildCareIcon />,
        color: '#1565C0',
        title: { en: 'Postnatal Care', si: 'ප්‍රසව පසු සත්කාර', ta: 'பிரசவத்திற்கு பிந்தைய பராமரிப்பு' },
        intro: { en: 'The postnatal period is critical for both mother and newborn...', si: 'ප්‍රසව පසු කාලය...', ta: 'பிரசவத்திற்குப் பிந்தைய காலம்...' },
        facts: { en: ['First 6 weeks are critical', 'Exclusive breastfeeding for 6 months'], si: ['පළමු සති 6 ඉතා වැදගත්'], ta: ['முதல் 6 வாரங்கள் முக்கியமானவை'] },
        didYouKnow: { en: 'Postpartum depression affects about 1 in 7 new mothers...', si: 'ප්‍රසව පසු මානසික අවපීඩනය...', ta: 'பிரசவத்திற்குப் பிந்தைய மனச்சோர்வு...' },
        tips: { en: ['Exclusively breastfeed for the first 6 months', 'Rest as much as possible'], si: ['පළමු මාස 6 සඳහා අනන්‍යව මව්කිරි දෙන්න'], ta: ['முதல் 6 மாதங்களுக்கு பிரத்யேகமாக தாய்ப்பால் கொடுங்கள்'] },
    },
    {
        id: 'pcos',
        icon: <HealingIcon />,
        color: '#7B1FA2',
        title: { en: 'PCOS Awareness', si: 'PCOS දැනුවත්භාවය', ta: 'PCOS விழிப்புணர்வு' },
        intro: { en: 'Polycystic Ovary Syndrome (PCOS) affects 1 in 10 women...', si: 'Polycystic Ovary Syndrome (PCOS)...', ta: 'பாலிசிஸ்டிக் ஓவரி சிண்ட்ரோம் (PCOS)...' },
        facts: { en: ['Affects ~10% of women', 'Leading cause of infertility'], si: ['~10% කාන්තාවන්ට බලපායි'], ta: ['~10% பெண்களை பாதிக்கிறது'] },
        didYouKnow: { en: 'Many women with PCOS don\'t know they have it...', si: 'PCOS ඇති බොහෝ කාන්තාවන්...', ta: 'PCOS உள்ள பல பெண்களுக்கு...' },
        tips: { en: ['Maintain a healthy weight through regular exercise', 'Choose low-glycaemic index foods'], si: ['නිතිපතා ව්‍යායාම මගින් සෞඛ්‍ය සම්පන්න බරක් පවත්වා ගන්න'], ta: ['வழக்கமான உடற்பயிற்சி மூலம் ஆரோக்கியமான எடையை பராமரிக்கவும்'] },
    },
    {
        id: 'menstrual',
        icon: <WaterDropIcon />,
        color: '#D81B60',
        title: { en: 'Menstrual Health', si: 'ඔසප් සෞඛ්‍ය', ta: 'மாதவிடாய் சுகாதாரம்' },
        intro: { en: 'Understanding your menstrual cycle is fundamental...', si: 'ඔබේ ඔසප් චක්‍රය...', ta: 'உங்கள் மாதவிடாய் சுழற்சியைப் புரிந்துகொள்வது...' },
        facts: { en: ['Normal cycle: 21–35 days', 'Period duration: 3–7 days'], si: ['සාමාන්‍ය චක්‍රය: දින 21-35'], ta: ['இயல்பான சுழற்சி: 21-35 நாட்கள்'] },
        didYouKnow: { en: 'The ovulation window typically occurs around day 14...', si: 'ඩිම්බ මෝචන කවුළුව...', ta: 'அண்டவிடுப்பு சாளரம்...' },
        tips: { en: ['Use this app to log every period start date', 'Stay hydrated'], si: ['සෑම ඔසප් ආරම්භ දිනයක්ම සටහන් කිරීමට...'], ta: ['ஒவ்வொரு மாதவிடாய் தொடக்க தேதியையும் பதிவு செய்ய...'] },
    },
    {
        id: 'anaemia',
        icon: <BloodtypeIcon />,
        color: '#c62828',
        title: { en: 'Anaemia & Iron Deficiency', si: 'රක්ත හීනතාවය සහ යකඩ ඌනතාවය', ta: 'இரத்த சோகை & இரும்புச்சத்து குறைபாடு' },
        intro: { en: 'Iron deficiency anaemia is the most common nutritional deficiency...', si: 'යකඩ ඌනතා රක්ත හීනතාවය...', ta: 'இரும்புச்சத்து குறைபாடு இரத்த சோகை...' },
        facts: { en: ['30% of Sri Lankan women are anaemic', 'Iron needs double during pregnancy'], si: ['ශ්‍රී ලංකා කාන්තාවන්ගෙන් 30%...'], ta: ['இலங்கை பெண்களில் 30%...'] },
        didYouKnow: { en: 'A simple haemoglobin test at your local clinic can detect anaemia.', si: 'ඔබේ දේශීය සායනයේ...', ta: 'உங்கள் உள்ளூர் மருத்துவமனையில்...' },
        tips: { en: ['Eat iron-rich foods: red meat, spinach, lentils, beetroot', 'Pair iron foods with vitamin C'], si: ['යකඩ බහුල ආහාර ගන්න...'], ta: ['இரும்புச்சத்து நிறைந்த உணவுகளை...'] },
    },
    {
        id: 'nutrition',
        icon: <RestaurantIcon />,
        color: '#FF6F00',
        title: { en: 'Nutrition & Diet', si: 'පෝෂණය සහ ආහාර', ta: 'ஊட்டச்சத்து & உணவு' },
        intro: { en: 'Good nutrition is the foundation of women\'s health...', si: 'හොඳ පෝෂණය...', ta: 'நல்ல ஊட்டச்சத்து...' },
        facts: { en: ['Calcium: 1000mg/day for women', 'Folic acid critical before & during pregnancy'], si: ['කැල්සියම්: කාන්තාවන් සඳහා දිනකට 1000mg'], ta: ['கால்சியம்: பெண்களுக்கு நாளொன்றுக்கு 1000mg'] },
        didYouKnow: { en: 'The traditional Sri Lankan diet with red rice, leafy greens...', si: 'රතු හාල්, කොළ එළවළු...', ta: 'சிவப்பு அரிசி, கீரைகள்...' },
        tips: { en: ['Eat a variety of coloured vegetables and fruits daily', 'Include protein in every meal'], si: ['විවිධ වර්ණ එළවළු...'], ta: ['தினமும் பல்வேறு நிற காய்கறிகள்...'] },
    },
];

interface TopicNodeData {
    id: string;
    type: 'category' | 'topic';
    title: Record<string, string>;
    topic?: Topic;
}

// Build the Health Tree
const buildHealthTree = () => {
    const tree = new HealthTree<TopicNodeData>({
        id: 'root',
        type: 'category',
        title: { en: 'Health Library', si: 'සෞඛ්‍ය පුස්තකාලය', ta: 'சுகாதார நூலகம்' }
    });

    const maternalCat = new TreeNode<TopicNodeData>({ id: 'cat_maternal', type: 'category', title: { en: 'Maternal Health', si: 'මාතෘ සෞඛ්‍යය', ta: 'தாய்வழி சுகாதாரம்' } });
    maternalCat.addChild(new TreeNode({ id: 'pregnancy', type: 'topic', title: TOPICS[0].title, topic: TOPICS[0] }));
    maternalCat.addChild(new TreeNode({ id: 'postnatal', type: 'topic', title: TOPICS[1].title, topic: TOPICS[1] }));
    
    const womensCat = new TreeNode<TopicNodeData>({ id: 'cat_womens', type: 'category', title: { en: 'Women\'s Health', si: 'කාන්තා සෞඛ්‍යය', ta: 'பெண்கள் ஆரோக்கியம்' } });
    womensCat.addChild(new TreeNode({ id: 'pcos', type: 'topic', title: TOPICS[2].title, topic: TOPICS[2] }));
    womensCat.addChild(new TreeNode({ id: 'menstrual', type: 'topic', title: TOPICS[3].title, topic: TOPICS[3] }));
    
    const nutritionCat = new TreeNode<TopicNodeData>({ id: 'cat_nutrition', type: 'category', title: { en: 'Nutrition & Deficiencies', si: 'පෝෂණය සහ ඌනතා', ta: 'ஊட்டச்சத்து மற்றும் குறைபாடுகள்' } });
    nutritionCat.addChild(new TreeNode({ id: 'anaemia', type: 'topic', title: TOPICS[4].title, topic: TOPICS[4] }));
    nutritionCat.addChild(new TreeNode({ id: 'nutrition', type: 'topic', title: TOPICS[5].title, topic: TOPICS[5] }));

    tree.root.addChild(maternalCat);
    tree.root.addChild(womensCat);
    tree.root.addChild(nutritionCat);

    return tree;
};

const HEALTH_TREE = buildHealthTree();

export default function AwarenessContent() {
    const { language } = useHealthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const t = {
        en: { title: 'Health Library', didYouKnow: '💡 Did you know?', tips: 'Practical Tips', keyFacts: 'Key Facts', search: 'Search topics via BFS Algorithm...', noResults: 'No topics found for your search.' },
        si: { title: 'සෞඛ්‍ය පුස්තකාලය', didYouKnow: '💡 ඔබ දැනගෙන හිටියාද?', tips: 'ප්‍රායෝගික උපදෙස්', keyFacts: 'ප්‍රධාන කරුණු', search: 'මාතෘකා සොයන්න...', noResults: 'ඔබේ සෙවීම සඳහා මාතෘකා කිසිවක් හමු නොවීය.' },
        ta: { title: 'சுகாதார நூலகம்', didYouKnow: '💡 தெரியுமா?', tips: 'நடைமுறை குறிப்புகள்', keyFacts: 'முக்கிய தகவல்கள்', search: 'தலைப்புகளைத் தேடுங்கள்...', noResults: 'உங்கள் தேடலுக்கான தலைப்புகள் எதுவும் கிடைக்கவில்லை.' },
    }[language];

    // Use Breadth-First Search (BFS) to filter topics!
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        
        // Use the custom findAllBFS algorithm from our Tree DSA
        const matches = HEALTH_TREE.findAllBFS((data) => {
            if (data.type !== 'topic' || !data.topic) return false;
            const titleMatch = data.title[language]?.toLowerCase().includes(query) || data.title['en'].toLowerCase().includes(query);
            const introMatch = data.topic.intro[language]?.toLowerCase().includes(query) || data.topic.intro['en'].toLowerCase().includes(query);
            return !!titleMatch || !!introMatch;
        });

        return matches.map(m => m.data.topic!);
    }, [searchQuery, language]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setIsSearching(e.target.value.trim().length > 0);
    };

    const renderTopic = (topic: Topic) => (
        <Accordion key={topic.id} sx={{
            borderRadius: '12px !important', overflow: 'hidden', mb: 2,
            border: '1px solid #f0f0f0',
            '&:before': { display: 'none' },
            '&.Mui-expanded': { boxShadow: `0 4px 20px ${topic.color}15` },
        }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{
                '&.Mui-expanded': { borderBottom: `2px solid ${topic.color}22` },
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: `${topic.color}18`, width: 44, height: 44 }}>
                        {React.cloneElement(topic.icon as React.ReactElement<any>, { sx: { color: topic.color } })}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>{topic.title[language] || topic.title['en']}</Typography>
                </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pb: 3 }}>
                <Typography variant="body1" sx={{ mb: 3, mt: 2, lineHeight: 1.8, color: 'text.secondary' }}>
                    {topic.intro[language] || topic.intro['en']}
                </Typography>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>{t.keyFacts}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(topic.facts[language] || topic.facts['en']).map((fact, i) => (
                            <Chip key={i} label={fact} variant="outlined" sx={{ borderColor: `${topic.color}44`, color: topic.color, fontWeight: 500 }} />
                        ))}
                    </Box>
                </Box>
                <Alert icon={<LightbulbIcon sx={{ color: '#FF6F00' }} />} severity="info" sx={{
                    mb: 3, borderRadius: 2, bgcolor: '#FFF8E1', border: '1px solid #FFE082',
                    '& .MuiAlert-icon': { color: '#FF6F00' },
                }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>{t.didYouKnow}</Typography>
                    <Typography variant="body2">{topic.didYouKnow[language] || topic.didYouKnow['en']}</Typography>
                </Alert>
                <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>{t.tips}</Typography>
                    <Stack spacing={1}>
                        {(topic.tips[language] || topic.tips['en']).map((tip, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                <Box sx={{
                                    width: 24, height: 24, borderRadius: '50%',
                                    bgcolor: `${topic.color}18`, color: topic.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, mt: 0.25,
                                }}>{i + 1}</Box>
                                <Typography variant="body2" color="text.secondary">{tip}</Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </AccordionDetails>
        </Accordion>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    {t.title}
                </Typography>
                
                <TextField
                    placeholder={t.search}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    size="small"
                    sx={{ width: { xs: '100%', md: 300 }, '& .MuiOutlinedInput-root': { borderRadius: 6, bgcolor: '#fff' } }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <AccountTreeIcon fontSize="small" sx={{ color: 'primary.main', mr: 0.5 }} />
                            </InputAdornment>
                        ),
                        endAdornment: searchQuery ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => { setSearchQuery(''); setIsSearching(false); }}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                    }}
                />
            </Box>

            {isSearching ? (
                <Box>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
                        Search Results ({searchResults.length})
                    </Typography>
                    {searchResults.length > 0 ? (
                        searchResults.map(renderTopic)
                    ) : (
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #ccc' }}>
                            <SearchIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                            <Typography color="textSecondary">{t.noResults}</Typography>
                        </Paper>
                    )}
                </Box>
            ) : (
                <Box>
                    {/* Render from Tree Structure */}
                    {HEALTH_TREE.root.children.map((catNode) => (
                        <Box key={catNode.data.id} sx={{ mb: 4 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: 'text.secondary', borderBottom: '2px solid #eee', pb: 1 }}>
                                {catNode.data.title[language] || catNode.data.title['en']}
                            </Typography>
                            <Stack spacing={0}>
                                {catNode.children.map((topicNode) => renderTopic(topicNode.data.topic!))}
                            </Stack>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}
