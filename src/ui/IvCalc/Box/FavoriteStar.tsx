import { styled } from "@mui/system";
import React from "react";
import type { FavoriteColor } from "../../../util/Box/FavoriteColor";

/** Fill color */
export const favoriteBorderColors: Record<FavoriteColor, string> = {
	yellow: "#d1c70b",
	green: "#16d660",
	orange: "#f5a300",
	blue: "#1789fc",
	pink: "#e672be",
	brown: "#aa6633",
	red: "#dd0000",
	purple: "#9b66f8",
	lightblue: "#00bbff",
	gray: "#888888",
};

/** Border color */
export const favoriteCssColors: Record<FavoriteColor, string> = {
	yellow: "#f9e74a",
	green: "#24d76a",
	orange: "#fab855",
	blue: "#44a2fd",
	pink: "#fe7b96",
	brown: "#bd8054",
	red: "#ff3333",
	purple: "#b598f8",
	lightblue: "#66ccff",
	gray: "#a0a0a0",
};

// Same path as the MUI Star icon
const starPath =
	"M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

/**
 * Star of the favorite color.
 */
const FavoriteStar = React.memo(
	({
		color,
		filled = true,
		size = 16,
		style,
	}: {
		color: FavoriteColor | null;
		filled?: boolean;
		size?: number;
		style?: React.CSSProperties;
	}) => {
		const fillColor = color === null ? "#999999" : favoriteCssColors[color];
		const borderColor =
			color === null ? "#999999" : favoriteBorderColors[color];
		const isFilled = filled && color !== null;
		return (
			<svg
				viewBox="0 0 24 24"
				width={size}
				height={size}
				style={{ overflow: "visible", ...style }}
				aria-hidden="true"
			>
				{isFilled && (
					<path
						d={starPath}
						fill={fillColor}
						strokeWidth={0}
						strokeLinejoin="round"
					/>
				)}
				<path
					d={starPath}
					stroke={borderColor}
					strokeWidth={2}
					fill="transparent"
					strokeLinejoin="round"
				/>
			</svg>
		);
	},
);

/**
 * Cascaded stars of the favorite colors.
 */
export const FavoriteStars = React.memo(
	({ colors }: { colors: FavoriteColor[] }) => {
		const count = Math.max(1, colors.length);
		if (colors.length === 0) {
			return (
				<StyledFavoriteStars className="line1">
					<FavoriteStar color={null} />
				</StyledFavoriteStars>
			);
		}

		const elements = colors.map((color, i) => (
			<FavoriteStar
				key={color}
				color={color}
				style={{ position: "relative", zIndex: colors.length - i }}
			/>
		));

		if (count <= 4) {
			return (
				<StyledFavoriteStars className="line1">{elements}</StyledFavoriteStars>
			);
		}

		const rows = Math.ceil(count / 2);
		const l1 = elements.slice(0, rows);
		const l2 = elements.slice(rows);
		return (
			<StyledFavoriteStars className="line2">
				<div className="l1">{l1}</div>
				<div className="l2">{l2}</div>
			</StyledFavoriteStars>
		);
	},
);

const StyledFavoriteStars = styled("div")({
	"&.line1": {
		height: "22px",
		"& > svg": {
			width: "22px",
			height: "22px",
			filter: "drop-shadow(2px 1px 0px rgba(255, 0, 0, 0.1))",
		},
		"& > svg+svg": {
			marginLeft: "-10px",
		},
	},
	"&.line2": {
		justifyItems: "start",
		"& > div": {
			"&.l2": {
				marginTop: "-8px",
				marginLeft: "2px",
			},
			height: "16px",
			lineHeight: 0,
			"& > svg": {
				width: "16px",
				height: "16px",
				filter: "drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.1))",
			},
			"& > svg+svg": {
				marginLeft: "-5px",
			},
		},
	},
});

export default FavoriteStar;
