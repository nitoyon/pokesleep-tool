import { IconButton, InputAdornment } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import NumericInput, { type NumericInputHandle } from "./NumericInput";
import SliderAndArrow from "./SliderAndArrow";

const PercentSliderInput = React.memo(
	({
		value,
		min,
		max,
		step,
		candidateStep,
		sx,
		onChange,
	}: {
		value: number;
		min: number;
		max: number;
		step: number;
		candidateStep: number;
		sx: object;
		onChange: (value: number) => void;
	}) => {
		const inputRef = React.useRef<NumericInputHandle | null>(null);

		const onPercentClick = React.useCallback(
			(percent: number) => {
				inputRef.current?.close();

				// WARNING: It is important to call close() before onChange()
				// to avoid focus-related issues on NumericInputKeyboard.
				onChange(percent);
			},
			[onChange],
		);

		// Generate percentage candidates
		const percentages: number[] = [];
		for (let i = min; i <= max; i += candidateStep) {
			percentages.push(i);
		}

		return (
			<NumericInput
				ref={inputRef}
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={onChange}
				sx={sx}
				endAdornment={
					<InputAdornment
						position="end"
						onClick={() => inputRef.current?.focus()}
					>
						<span style={{ fontSize: "0.8rem", color: "#888" }}>%</span>
					</InputAdornment>
				}
			>
				<div>
					<SliderAndArrow
						min={min}
						max={max}
						step={step}
						value={value}
						onChange={onChange}
						sx={{ padding: "0.5rem 1rem 0 1rem" }}
					/>
					<StyledPercentGrid>
						{percentages.map((p) => (
							<IconButton key={p} onClick={() => onPercentClick(p)}>
								{p}%
							</IconButton>
						))}
					</StyledPercentGrid>
				</div>
			</NumericInput>
		);
	},
);

const StyledPercentGrid = styled("div")({
	display: "grid",
	gridTemplateColumns: "repeat(6, 3.2rem)",
	gap: 0,
	"& > button": {
		width: "3.2rem",
		height: "2rem",
		borderRadius: 0,
		fontSize: "0.85rem",
	},
});

export default PercentSliderInput;
