import { Input, InputAdornment } from "@mui/material";
import React from "react";
import PopperMenu from "./PopperMenu";
import SliderAndArrow from "./SliderAndArrow";

const RateTextField = React.memo(
	({
		min,
		max,
		step = 0.1,
		value,
		onChange,
	}: {
		min: number;
		max: number;
		step?: number;
		value: number;
		onChange: (value: number) => void;
	}) => {
		const [open, setOpen] = React.useState(false);
		const [focused, setFocused] = React.useState(false);
		const [rawText, setRawText] = React.useState(value.toString());
		const anchorRef = React.useRef<HTMLElement>(null);

		const fractionDigits = getFractionDigits(step);

		const onFocus = React.useCallback(() => {
			setFocused(true);
			setOpen(true);
			setRawText(value.toFixed(fractionDigits));
		}, [value, fractionDigits]);

		const onBlur = React.useCallback(() => {
			setFocused(false);
		}, []);

		const onClose = React.useCallback(() => {
			setFocused(false);
			setOpen(false);
		}, []);

		const onKeyDown = React.useCallback(
			(e: React.KeyboardEvent<HTMLInputElement>) => {
				if (e.key === "Tab" || e.key === "Enter" || e.key === "Escape") {
					onClose();
				}
			},
			[onClose],
		);

		const onChangeHandler = React.useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				setRawText(e.target.value);

				const v = parseFloat(e.target.value);
				if (v !== value && min <= v && v <= max) {
					onChange(v);
				}
			},
			[min, max, onChange, value],
		);

		const text = focused ? rawText : value.toFixed(fractionDigits);

		return (
			<>
				<Input
					ref={anchorRef}
					value={text}
					onFocus={onFocus}
					onBlur={onBlur}
					onKeyDown={onKeyDown}
					onChange={onChangeHandler}
					endAdornment={
						<InputAdornment position="end">
							<span style={{ fontSize: "0.8rem", color: "#888" }}>%</span>
						</InputAdornment>
					}
					sx={{ width: "4rem" }}
					slotProps={{
						input: {
							sx: {
								"&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
									WebkitAppearance: "none",
									margin: 0,
								},
								MozAppearance: "textfield",
							},
						},
					}}
					inputProps={{
						inputMode: "decimal",
						min: min,
						max: max,
						step: step,
						type: "number",
					}}
				/>
				<PopperMenu open={open} anchorEl={anchorRef.current} onClose={onClose}>
					<div>
						<SliderAndArrow
							min={min}
							max={max}
							step={step}
							value={value}
							onChange={onChange}
							sx={{ padding: "0.5rem 1rem", width: "15rem" }}
						/>
					</div>
				</PopperMenu>
			</>
		);
	},
);

/**
 * Returns the number of fraction digits of the given step (e.g. 0.1 → 1).
 */
function getFractionDigits(step: number): number {
	const fraction = step.toString().split(".")[1];
	return fraction === undefined ? 0 : fraction.length;
}

export default RateTextField;
