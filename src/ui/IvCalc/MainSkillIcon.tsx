import React from 'react';
import { MainSkillName } from '../../util/MainSkill';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import SwipeOutlinedIcon from '@mui/icons-material/SwipeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import CoffeeIcon from '../Resources/CoffeeIcon';
import DreamShardIcon from '../Resources/DreamShardIcon';
import IngredientsIcon from '../Resources/IngredientsIcon';
import PotIcon from '../Resources/PotIcon';
import StreamIcon from '@mui/icons-material/Stream';
import SavedSearchOutlined from '@mui/icons-material/SavedSearchOutlined';

const MainSkillIcon = React.memo(({mainSkill, second}: {
    mainSkill: MainSkillName,
    second?: boolean,
}) => {
    switch (mainSkill) {
        case "Charge Energy S":
        case "Charge Energy S (Moonlight)":
            return <FavoriteBorderIcon sx={{color: "#ff88aa"}} fontSize="small"/>;
        case "Energy for Everyone S":
            return <VolunteerActivismIcon sx={{color: "#ff88aa"}} fontSize="small"/>;
        case "Energy for Everyone S (Lunar Blessing)":
            if (second !== true) {
                return <VolunteerActivismIcon sx={{color: "#ff88aa"}} fontSize="small"/>;
            } else {
                return <LocalFireDepartmentIcon sx={{color: "#ff944b"}}/>;
            }
        case "Energizing Cheer S":
            return <VolunteerActivismOutlinedIcon sx={{color: "#ff88aa"}} fontSize="small"/>;
        case "Charge Strength M":
        case "Charge Strength M (Bad Dreams)":
        case "Charge Strength S":
        case "Charge Strength S (Random)":
        case "Charge Strength S (Stockpile)":
        case "Berry Burst":
        case "Berry Burst (Disguise)":
                return <LocalFireDepartmentIcon sx={{color: "#ff944b"}}/>;
        case "Dream Shard Magnet S":
        case "Dream Shard Magnet S (Random)":
            return <DreamShardIcon/>;
        case "Extra Helpful S":
            return <SearchIcon sx={{color: "#66cc66"}} fontSize="small"/>;
        case "Helper Boost":
            return <SavedSearchOutlined sx={{color: "#66cc66"}} fontSize="small"/>;
        case "Ingredient Magnet S (Plus)":
            if (second !== true) {
                return <IngredientsIcon fontSize="small"/>;
            } else {
                return <CoffeeIcon fontSize="small"/>;
            }
        case "Ingredient Magnet S":
        case "Ingredient Draw S":
        case "Ingredient Draw S (Super Luck)":
        case "Ingredient Draw S (Hyper Cutter)":
            return <IngredientsIcon fontSize="small"/>;
        case "Cooking Power-Up S":
            return <PotIcon sx={{color: "#886666"}} fontSize="small"/>;
        case "Cooking Power-Up S (Minus)":
            if (second !== true) {
                return <PotIcon sx={{color: "#886666"}} fontSize="small"/>;
            } else {
                return <VolunteerActivismOutlinedIcon sx={{color: "#ff88aa"}} fontSize="small"/>;
            }
        case "Tasty Chance S":
            return <PriorityHighIcon sx={{color: "#ff0000"}} fontSize="small"/>;
        case "Metronome":
            return <SwipeOutlinedIcon sx={{color: "#999"}} fontSize="small"/>;
        case "Skill Copy":
        case "Skill Copy (Mimic)":
        case "Skill Copy (Transform)":
            return <StreamIcon sx={{color: "#999"}} fontSize="small"/>;
        default:
            return <>ー</>;
    }
});

export default MainSkillIcon;
