import React from "react";
import type { IngredientName } from "../../data/pokemons";
import AppleIcon from "../Resources/AppleIcon";
import AvocadoIcon from "../Resources/AvocadoIcon";
import CacaoIcon from "../Resources/CacaoIcon";
import CoffeeIcon from "../Resources/CoffeeIcon";
import CornIcon from "../Resources/CornIcon";
import EggIcon from "../Resources/EggIcon";
import GingerIcon from "../Resources/GingerIcon";
import HerbIcon from "../Resources/HerbIcon";
import HoneyIcon from "../Resources/HoneyIcon";
import LeekIcon from "../Resources/LeekIcon";
import MushroomIcon from "../Resources/MushroomIcon";
import MilkIcon from "../Resources/MilkIcon";
import PumpkinIcon from "../Resources/PumpkinIcon";
import OilIcon from "../Resources/OilIcon";
import PotatoIcon from "../Resources/PotatoIcon";
import SausageIcon from "../Resources/SausageIcon";
import SoyIcon from "../Resources/SoyIcon";
import TailIcon from "../Resources/TailIcon";
import TomatoIcon from "../Resources/TomatoIcon";

const IngredientIcon = React.memo(({ name }: { name: IngredientName }) => {
	switch (name) {
		case "apple":
			return <AppleIcon />;
		case "avocado":
			return <AvocadoIcon />;
		case "cacao":
			return <CacaoIcon />;
		case "coffee":
			return <CoffeeIcon />;
		case "corn":
			return <CornIcon />;
		case "egg":
			return <EggIcon />;
		case "ginger":
			return <GingerIcon />;
		case "herb":
			return <HerbIcon />;
		case "honey":
			return <HoneyIcon />;
		case "leek":
			return <LeekIcon />;
		case "mushroom":
			return <MushroomIcon />;
		case "milk":
			return <MilkIcon />;
		case "oil":
			return <OilIcon />;
		case "potato":
			return <PotatoIcon />;
		case "pumpkin":
			return <PumpkinIcon />;
		case "sausage":
			return <SausageIcon />;
		case "soy":
			return <SoyIcon />;
		case "tail":
			return <TailIcon />;
		case "tomato":
			return <TomatoIcon />;
		case "unknown":
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					role="img"
					aria-label="unknown"
				>
					<line
						x1="1.2"
						y1="12"
						x2="12"
						y2="12"
						stroke="#bbbbbb"
						strokeWidth="1.44"
					/>
				</svg>
			);
		case "unknown1":
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					role="img"
					aria-label="unknown1"
				>
					<circle cx="12" cy="12" r="8" fill="#eaae35" />
				</svg>
			);
		case "unknown2":
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					role="img"
					aria-label="unknown2"
				>
					<circle cx="12" cy="12" r="8" fill="#56c0fe" />
				</svg>
			);
		case "unknown3":
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					role="img"
					aria-label="unknown3"
				>
					<circle cx="12" cy="12" r="8" fill="#f55865" />
				</svg>
			);
	}
	return null;
});

export default IngredientIcon;
