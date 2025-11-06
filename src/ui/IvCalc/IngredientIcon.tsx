import React from 'react';
import { IngredientName } from '../../data/pokemons';
import AppleIcon from '../Resources/AppleIcon';
import AvocadoIcon from '../Resources/AvocadoIcon';
import CacaoIcon from '../Resources/CacaoIcon';
import CoffeeIcon from '../Resources/CoffeeIcon';
import CornIcon from '../Resources/CornIcon';
import EggIcon from '../Resources/EggIcon';
import GingerIcon from '../Resources/GingerIcon';
import HerbIcon from '../Resources/HerbIcon';
import HoneyIcon from '../Resources/HoneyIcon';
import LeekIcon from '../Resources/LeekIcon';
import MushroomIcon from '../Resources/MushroomIcon';
import MilkIcon from '../Resources/MilkIcon';
import PumpkinIcon from '../Resources/PumpkinIcon';
import OilIcon from '../Resources/OilIcon';
import PotatoIcon from '../Resources/PotatoIcon';
import SausageIcon from '../Resources/SausageIcon';
import SoyIcon from '../Resources/SoyIcon';
import TailIcon from '../Resources/TailIcon';
import TomatoIcon from '../Resources/TomatoIcon';

const IngredientIcon = React.memo(({name}: {name: IngredientName}) => {
    switch (name) {
        case "apple": return <AppleIcon/>;
        case "avocado": return <AvocadoIcon/>;
        case "cacao": return <CacaoIcon/>;
        case "coffee": return <CoffeeIcon/>;
        case "corn": return <CornIcon/>;
        case "egg": return <EggIcon/>;
        case "ginger": return <GingerIcon/>;
        case "herb": return <HerbIcon/>;
        case "honey": return <HoneyIcon/>;
        case "leek": return <LeekIcon/>;
        case "mushroom": return <MushroomIcon/>;
        case "milk": return <MilkIcon/>;
        case "oil": return <OilIcon/>;
        case "potato": return <PotatoIcon/>;
        case "pumpkin": return <PumpkinIcon/>;
        case "sausage": return <SausageIcon/>;
        case "soy": return <SoyIcon/>;
        case "tail": return <TailIcon/>;
        case "tomato": return <TomatoIcon/>;
        case "unknown":
            return <svg width="24" height="20" viewBox="0 0 24 24">
                <svg viewBox="0 0 200 200">
                    <line x1="10" y1="100" x2="180" y2="100" stroke="#bbbbbb" strokeWidth="12" />
                </svg>
            </svg>;
        case "unknown1":
            return <svg width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" fill="#eaae35"/>
            </svg>;
        case "unknown2":
            return <svg width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" fill="#56c0fe"/>
            </svg>;
        case "unknown3":
            return <svg width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="8" fill="#f55865"/>
            </svg>;
    }
    return <></>;
});

export default IngredientIcon;
