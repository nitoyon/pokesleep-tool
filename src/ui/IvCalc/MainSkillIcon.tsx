import React from 'react';
import { IngredientName } from '../../data/pokemons';
import { MainSkillName } from '../../util/MainSkill';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import SwipeOutlinedIcon from '@mui/icons-material/SwipeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import IngredientIcon from './IngredientIcon';
import CandyIcon from '../Resources/CandyIcon';
import CookingAssistIcon from '../Resources/CookingAssistIcon';
import IngredientDrawIcon from '../Resources/IngredientDrawIcon';
import DreamShardIcon from '../Resources/DreamShardIcon';
import HyperCutterIcon from '../Resources/HyperCutterIcon';
import IngredientsIcon from '../Resources/IngredientsIcon';
import SuperLuckIcon from '../Resources/SuperLuckIcon';
import PotIcon from '../Resources/PotIcon';
import StreamIcon from '@mui/icons-material/Stream';
import SavedSearchOutlined from '@mui/icons-material/SavedSearchOutlined';

const MainSkillIcon = React.memo(({mainSkill, second, firstIngredient}: {
    mainSkill: MainSkillName,
    second?: boolean,
    firstIngredient?: IngredientName,
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
        case "Energy for Everyone S (Berry Juice)":
            if (second !== true) {
                return <VolunteerActivismIcon sx={{color: "#ff88aa"}} fontSize="small"/>;
            } else {
                return <LocalDrinkIcon sx={{color: "#39e17aff"}}/>;
            }
        case "Energizing Cheer S":
        case "Energizing Cheer S (Nuzzle)":
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
                return <IngredientIcon name={firstIngredient ?? "apple"}/>;
            }
        case "Ingredient Magnet S (Present)":
            if (second !== true) {
                return <IngredientsIcon fontSize="small"/>;
            } else {
                return <CandyIcon fontSize="small"/>;
            }
        case "Ingredient Magnet S":
            return <IngredientsIcon fontSize="small"/>;
        case "Ingredient Draw S":
            return <IngredientDrawIcon fontSize="small"
                firstIngredient={firstIngredient ?? "avocado"}/>;
        case "Ingredient Draw S (Hyper Cutter)":
            return <HyperCutterIcon fontSize="small"/>;
        case "Ingredient Draw S (Super Luck)":
            if (second !== true) {
                return <SuperLuckIcon fontSize="small"/>;
            } else {
                return <DreamShardIcon/>;
            }
        case "Cooking Assist":
            return <CookingAssistIcon/>;
        case "Cooking Assist (Bulk Up)":
            if (second !== true) {
                return <IngredientsIcon/>;
            } else {
                return <PriorityHighIcon sx={{color: '#ff0000'}} fontSize="small"/>;
            }
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
