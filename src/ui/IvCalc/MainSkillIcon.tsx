import React from 'react';
import { MainSkillName } from '../../util/MainSkill';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import SwipeOutlinedIcon from '@mui/icons-material/SwipeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import DreamShardIcon from '../Resources/DreamShardIcon';
import IngredientsIcon from '../Resources/IngredientsIcon';
import PotIcon from '../Resources/PotIcon';
import StreamIcon from '@mui/icons-material/Stream';
import SavedSearchOutlined from '@mui/icons-material/SavedSearchOutlined';

const MainSkillIcon = React.memo(({mainSkill}: {mainSkill: MainSkillName}) => {
    switch (mainSkill) {
        case "Charge Energy S":
        case "Charge Energy S (Moonlight)":
            return <svg width="20" height="20"><FavoriteBorderIcon sx={{color: "#ff88aa"}}/></svg>;
        case "Energy for Everyone S":
        case "Energy for Everyone S (Lunar Blessing)":
            return <svg width="22" height="22"><VolunteerActivismIcon sx={{color: "#ff88aa"}}/></svg>;
        case "Energizing Cheer S":
            return <svg width="22" height="22"><VolunteerActivismOutlinedIcon sx={{color: "#ff88aa"}}/></svg>;
        case "Charge Strength M":
        case "Charge Strength M (Bad Dreams)":
        case "Charge Strength S":
        case "Charge Strength S (Random)":
        case "Charge Strength S (Stockpile)":
        case "Berry Burst":
        case "Berry Burst (Disguise)":
                return <svg width="24" height="24"><LocalFireDepartmentIcon sx={{color: "#ff944b"}}/></svg>;
        case "Dream Shard Magnet S":
        case "Dream Shard Magnet S (Random)":
            return <svg width="20" height="20"><DreamShardIcon/></svg>;
        case "Extra Helpful S":
            return <svg width="20" height="20"><SearchIcon sx={{color: "#66cc66"}}/></svg>;
        case "Helper Boost":
            return <svg width="20" height="20"><SavedSearchOutlined sx={{color: "#66cc66"}}/></svg>;
        case "Ingredient Magnet S":
        case "Ingredient Draw S":
        case "Ingredient Draw S (Super Luck)":
            return <svg width="20" height="20"><IngredientsIcon/></svg>;
        case "Cooking Power-Up S":
            return <svg width="20" height="20" fill="#886666"><PotIcon/></svg>;
        case "Tasty Chance S":
            return <svg width="20" height="20"><PriorityHighIcon sx={{color: "#ff0000"}}/></svg>;
        case "Metronome":
            return <svg width="22" height="22"><SwipeOutlinedIcon sx={{color: "#999"}}/></svg>;
        case "Skill Copy":
        case "Skill Copy (Mimic)":
        case "Skill Copy (Transform)":
            return <svg width="22" height="22"><StreamIcon sx={{color: "#999"}}/></svg>;
        default:
            return <>ー</>;
    }
});

export default MainSkillIcon;
