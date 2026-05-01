import { styled } from "@mui/system";
import React from "react";
import PokemonIv from "../../util/PokemonIv";
import { AppConfigContext } from "../AppConfig";
import PokemonIconData from "./PokemonIconData";

const PokemonIcon = React.memo(
	({ idForm, size }: { idForm: number; size: number }) => {
		const appConfig = React.useContext(AppConfigContext);
		if (appConfig.iconUrl?.match(/^https?:\/\//)) {
			let url = appConfig.iconUrl;
			const id = PokemonIv.getIdByIdForm(idForm);
			url = url.replace(/@ID(\d)@/g, (_m, num) =>
				id.toString().padStart(parseInt(num, 10), "0"),
			);
			return <img src={url} width={size} height={size} alt={id.toString()} />;
		}

		const elements = createIconElements(idForm, size);
		return (
			<StyledIconContainer style={{ width: `${size}px`, height: `${size}px` }}>
				<svg
					width={size}
					height={size}
					viewBox={`0 0 ${size} ${size}`}
					role="img"
					aria-hidden={true}
				>
					{elements}
				</svg>
			</StyledIconContainer>
		);
	},
);

function createIconElements(
	idForm: number,
	size: number,
): React.ReactElement[] {
	let id: number;
	if (idForm in PokemonIconData) {
		id = idForm;
	} else {
		id = PokemonIv.getIdByIdForm(idForm);
		if (!(id in PokemonIconData)) {
			return [createEmptyIconElement(size)];
		}
	}

	const elements = PokemonIconData[id];
	const shape: React.ReactElement[] = [];
	let i = 0;
	for (const datum of elements) {
		const props: { rx?: string; ry?: string } = {};
		if (datum.r !== undefined) {
			props.rx = props.ry = (size * datum.r).toFixed(1);
		}
		shape.push(
			<rect
				key={i}
				x={(size * datum.x).toFixed(1)}
				y={(size * datum.y).toFixed(1)}
				width={(size * datum.w).toFixed(1)}
				height={(size * datum.h).toFixed(1)}
				fill={datum.color}
				{...props}
			/>,
		);
		i++;
	}
	return shape;
}

function createEmptyIconElement(size: number): React.ReactElement {
	return <rect x="0" y="0" width={size} height={size} fill="#bbbbbb" />;
}

const StyledIconContainer = styled("div")({
	border: "1px solid #999",
	borderRadius: ".5rem",
	overflow: "hidden",
});

export default PokemonIcon;
