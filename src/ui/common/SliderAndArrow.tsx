import { type SxProps, styled, type Theme } from "@mui/system";
import React from "react";
import ArrowButton from "./ArrowButton";
import SliderEx from "./SliderEx";

const SliderAndArrow = React.memo(
	({
		min,
		max,
		step = 1,
		value,
		onChange,
		sx,
	}: {
		min: number;
		max: number;
		step?: number;
		value: number;
		onChange: (value: number) => void;
		sx?: SxProps<Theme>;
	}) => {
		const onDownClick = React.useCallback(() => {
			onChange(Math.max(min, roundToStep(value - step, step)));
		}, [min, step, value, onChange]);
		const onUpClick = React.useCallback(() => {
			onChange(Math.min(max, roundToStep(value + step, step)));
		}, [max, step, value, onChange]);

		return (
			<SliderAndArrowContainer sx={sx}>
				<ArrowButton label="◀" disabled={value === min} onClick={onDownClick} />
				<SliderEx
					min={min}
					max={max}
					step={step}
					size="small"
					style={{ userSelect: "none" }}
					value={value}
					onChange2={onChange}
				/>
				<ArrowButton label="▶" disabled={value === max} onClick={onUpClick} />
			</SliderAndArrowContainer>
		);
	},
);

/**
 * Rounds the value to the nearest multiple of step,
 * removing floating point errors (e.g. 0.30000000000000004).
 */
function roundToStep(value: number, step: number): number {
	return parseFloat((Math.round(value / step) * step).toFixed(10));
}

const SliderAndArrowContainer = styled("div")({
	display: "flex",
	alignItems: "center",
	gap: ".7rem",
	height: "1.8rem",
	flex: 1,
});

export default SliderAndArrow;
