import React from 'react';
import MoodIcon from '@mui/icons-material/Mood';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import MoodBadIcon from '@mui/icons-material/MoodBad';

const EnergyIcon = React.memo(({energy}: {energy: number}) => {
    if (energy > 80) {
        return <MoodIcon sx={{color: '#62d540'}}/>;
    }
    if (energy > 60) {
        return <SentimentSatisfiedAltIcon sx={{color: '#66dcd8'}}/>;
    }
    if (energy > 40) {
        return <SentimentDissatisfiedIcon sx={{color: '#4aacfd'}}/>;
    }
    if (energy > 20) {
        return <SentimentVeryDissatisfiedIcon sx={{color: '#d4b5fd'}}/>;
    }
    return <MoodBadIcon sx={{color: '#a5a3a6'}}/>;
});

export default EnergyIcon;
