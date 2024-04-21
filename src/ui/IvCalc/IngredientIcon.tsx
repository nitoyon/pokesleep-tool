import React from 'react';
import { IngredientName } from '../../data/pokemons';
import AppleIcon from '../Resources/AppleIcon';
import CacaoIcon from '../Resources/CacaoIcon';
import CornIcon from '../Resources/CornIcon';
import EggIcon from '../Resources/EggIcon';
import GingerIcon from '../Resources/GingerIcon';
import HerbIcon from '../Resources/HerbIcon';
import HoneyIcon from '../Resources/HoneyIcon';
import LeekIcon from '../Resources/LeekIcon';
import MushroomIcon from '../Resources/MushroomIcon';
import MilkIcon from '../Resources/MilkIcon';
import OilIcon from '../Resources/OilIcon';
import PotatoIcon from '../Resources/PotatoIcon';
import SausageIcon from '../Resources/SausageIcon';
import SoyIcon from '../Resources/SoyIcon';
import TailIcon from '../Resources/TailIcon';
import TomatoIcon from '../Resources/TomatoIcon';

const IngredientIcon = React.memo(({name}: {name: IngredientName}) => {
    switch (name) {
        case "apple": return <AppleIcon/>;
        case "cacao": return <CacaoIcon/>;
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
        case "sausage": return <SausageIcon/>;
        case "soy": return <SoyIcon/>;
        case "tail": return <TailIcon/>;
        case "tomato": return <TomatoIcon/>;
    }
    return <></>;
});

export default IngredientIcon;
