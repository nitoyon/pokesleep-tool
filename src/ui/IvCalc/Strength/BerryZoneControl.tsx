import { IconButton, InputAdornment } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { maxBerryZoneRate } from "../../../util/MainSkill";
import NumericInput, {
	type NumericInputHandle,
} from "../../common/NumericInput";
import SliderAndArrow from "../../common/SliderAndArrow";

const BerryZoneControl = React.memo(
	({
		value,
		onChange,
	}: {
		value: number;
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

		// Generate percentage options (0%, 2%, 4%, ..., 24%)
		const percentages: number[] = [];
		for (let i = 0; i <= maxBerryZoneRate; i += 2) {
			percentages.push(i);
		}

		return (
			<NumericInput
				ref={inputRef}
				min={0}
				max={maxBerryZoneRate}
				step={0.2}
				value={value}
				onChange={onChange}
				sx={{ width: "3.4rem", fontSize: "0.9rem" }}
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
						min={0}
						max={maxBerryZoneRate}
						step={0.2}
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
	gridTemplateColumns: "repeat(5, 4rem)",
	gap: 0,
	"& > button": {
		width: "3.2rem",
		height: "2rem",
		borderRadius: 0,
		fontSize: "0.85rem",
	},
});

export default BerryZoneControl;
