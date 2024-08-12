import React from 'react';
import { MainSkillName } from '../../util/MainSkill';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SwipeOutlinedIcon from '@mui/icons-material/SwipeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import DreamShardIcon from '../Resources/DreamShardIcon';
import IngredientsIcon from '../Resources/IngredientsIcon';
import PotIcon from '../Resources/PotIcon';

const MainSkillIcon = React.memo(({mainSkill}: {mainSkill: MainSkillName}) => {
    switch (mainSkill) {
        case "Charge Energy S":
        case "Energizing Cheer S":
            return <svg width="20" height="20"><FavoriteBorderIcon sx={{color: "#ff88aa"}}/></svg>;
        case "Energy for Everyone S":
            return <svg width="22" height="22"><VolunteerActivismOutlinedIcon sx={{color: "#ff88aa"}}/></svg>;
        case "Charge Strength M":
        case "Charge Strength S":
        case "Charge Strength S (Random)":
            return <svg width="24" height="24"><LocalFireDepartmentIcon sx={{color: "#ff944b"}}/></svg>;
        case "Dream Shard Magnet S":
        case "Dream Shard Magnet S (Random)":
            return <svg width="20" height="20"><DreamShardIcon/></svg>;
        case "Extra Helpful S":
        case "Helper Boost":
            return <svg width="20" height="20"><SearchIcon sx={{color: "#66cc66"}}/></svg>;
        case "Ingredient Magnet S":
            return <svg width="20" height="20"><IngredientsIcon/></svg>;
        case "Cooking Power-Up S":
        case "Tasty Chance S":
            return <svg width="20" height="20" fill="#886666"><PotIcon/></svg>;
        case "Metronome":
            return <svg width="22" height="22"><SwipeOutlinedIcon sx={{color: "#999"}}/></svg>;
        default:
            return <>ー</>;
    }
});

export default MainSkillIcon;
