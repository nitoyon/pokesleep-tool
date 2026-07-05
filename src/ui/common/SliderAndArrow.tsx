import { type SxProps, styled, type Theme } from "@mui/system";
import React from "react";
import ArrowButton from "./ArrowButton";
import SliderEx from "./SliderEx";

const SliderAndArrow = React.memo(
	({
		min,
		max,
		value,
		disabled,
		onChange,
		sx,
	}: {
		min: number;
		max: number;
		value: number;
		disabled?: boolean;
		onChange: (value: number) => void;
		sx?: SxProps<Theme>;
	}) => {
		const onDownClick = React.useCallback(() => {
			onChange(value - 1);
		}, [value, onChange]);
		const onUpClick = React.useCallback(() => {
			onChange(value + 1);
		}, [value, onChange]);

		return (
			<SliderAndArrowContainer sx={sx}>
				<ArrowButton
					label="◀"
					disabled={disabled || value === min}
					onClick={onDownClick}
				/>
				<SliderEx
					min={min}
					max={max}
					size="small"
					style={{ userSelect: "none" }}
					disabled={disabled}
					value={value}
					onChange2={onChange}
				/>
				<ArrowButton
					label="▶"
					disabled={disabled || value === max}
					onClick={onUpClick}
				/>
			</SliderAndArrowContainer>
		);
	},
);

const SliderAndArrowContainer = styled("div")({
	display: "flex",
	alignItems: "center",
	gap: ".7rem",
	height: "1.8rem",
	flex: 1,
});

export default SliderAndArrow;
