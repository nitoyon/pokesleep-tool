import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
	Button,
	Checkbox,
	Divider,
	FormControlLabel,
	MenuItem,
	Popover,
} from "@mui/material";
import { styled } from "@mui/system";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
	type FavoriteColor,
	favoriteColors,
} from "../../../util/Box/FavoriteColor";
import BoxFilterConfig from "../../../util/Box/PokemonBoxFilter";
import FavoriteColorSelector from "./FavoriteColorSelector";
import FavoriteStar, { AllFavoriteStars } from "./FavoriteStar";

/**
 * Checkbox to filter favorite pokemon, with a link to choose the condition:
 * any favorite or one color. The popover closes when one is chosen.
 */
const FavoriteFilterControl = React.memo(
	({
		value,
		onChange,
	}: {
		value: BoxFilterConfig;
		onChange: (value: BoxFilterConfig) => void;
	}) => {
		const { t } = useTranslation();
		const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

		const onCheckChange = useCallback(() => {
			onChange(new BoxFilterConfig({ ...value, favorite: !value.favorite }));
		}, [value, onChange]);
		const onDetailClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
			setAnchor(e.currentTarget);
		}, []);
		const onPopoverClose = useCallback(() => {
			setAnchor(null);
		}, []);
		const onAnyClick = useCallback(() => {
			onChange(
				new BoxFilterConfig({ ...value, favorite: true, favoriteColor: null }),
			);
			setAnchor(null);
		}, [value, onChange]);
		const onColorClick = useCallback(
			(color: FavoriteColor) => {
				onChange(
					new BoxFilterConfig({
						...value,
						favorite: true,
						favoriteColor: color,
					}),
				);
				setAnchor(null);
			},
			[value, onChange],
		);

		const color = value.favoriteColor;
		const isAny = value.favorite && color === null;
		return (
			<StyledFavoriteFilterControl>
				<FormControlLabel
					label={t("favorite")}
					control={
						<Checkbox checked={value.favorite} onChange={onCheckChange} />
					}
				/>
				<Button onClick={onDetailClick} variant="outlined">
					{color !== null && <FavoriteStar color={color} />}
					<ArrowDropDownIcon />
				</Button>
				<Popover
					open={anchor !== null}
					anchorEl={anchor}
					onClose={onPopoverClose}
					anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				>
					<StyledFavoriteFilterPopover>
						<MenuItem selected={isAny} onClick={onAnyClick}>
							<AllFavoriteStars />
							<span style={{ paddingLeft: 5 }}>{t("all")}</span>
						</MenuItem>
						<Divider />
						<FavoriteColorSelector
							value={
								value.favorite && color !== null
									? 1 << favoriteColors.indexOf(color)
									: 0
							}
							onClick={onColorClick}
						/>
					</StyledFavoriteFilterPopover>
				</Popover>
			</StyledFavoriteFilterControl>
		);
	},
);

const StyledFavoriteFilterControl = styled("div")({
	display: "flex",
	alignItems: "center",
	marginTop: "8px",
	"& > label": {
		marginRight: "0.4rem",
		"& > .MuiFormControlLabel-label": {
			display: "flex",
			alignItems: "center",
			whiteSpace: "nowrap",
		},
	},
	"& > button": {
		borderColor: "rgba(0, 0, 0, 0.12)",
		color: "rgba(0, 0, 0, 0.87)",
		minWidth: "24px",
		padding: 1,
	},
});

const StyledFavoriteFilterPopover = styled("div")({
	padding: "0.3rem 0",
	"& > li": {
		borderRadius: "0.3rem",
		margin: "0 0.3rem",
		"& > svg, & > span.space": {
			width: "20px",
			height: "20px",
			marginRight: "0.5rem",
		},
	},
	"& > h5": {
		margin: "0.6rem 1rem 0",
		fontWeight: "normal",
		color: "#666666",
	},
	"& > div": {
		margin: "0 0.5rem",
	},
});

export default FavoriteFilterControl;
