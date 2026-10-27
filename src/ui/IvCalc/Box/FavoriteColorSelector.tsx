import { IconButton } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import {
	type FavoriteColor,
	favoriteColors,
	favoriteMaskToColors,
} from "../../../util/Box/FavoriteColor";
import FavoriteStar from "./FavoriteStar";

/**
 * Toggle buttons to select favorite colors.
 * @param value Bit mask of the selected colors.
 */
const FavoriteColorSelector = React.memo(
	({
		value,
		onClick,
	}: {
		value: number;
		onClick: (color: FavoriteColor) => void;
	}) => {
		const selected = favoriteMaskToColors(value);
		return (
			<StyledFavoriteColorSelector>
				{favoriteColors.map((color) => {
					const isSelected = selected.includes(color);
					return (
						<IconButton
							key={color}
							className={isSelected ? "selected" : ""}
							disableRipple
							aria-pressed={isSelected}
							onClick={() => onClick(color)}
						>
							<FavoriteStar color={color} filled={isSelected} size={24} />
						</IconButton>
					);
				})}
			</StyledFavoriteColorSelector>
		);
	},
);

const StyledFavoriteColorSelector = styled("div")({
	display: "grid",
	gridTemplateColumns: "repeat(5, auto)",
	padding: ".3rem",
	"& > button": {
		padding: "6px",
	},
});

export default FavoriteColorSelector;
