import React from "react";
import PercentSliderInput from "../../common/PercentSliderInput";

const maxBonus = 100;

const AreaBonusControl = React.memo(
	({
		value,
		onChange,
	}: {
		value: number;
		onChange: (value: number) => void;
	}) => {
		return (
			<PercentSliderInput
				min={0}
				max={maxBonus}
				step={1}
				candidateStep={5}
				value={value}
				onChange={onChange}
				sx={{ width: "2.5rem", fontSize: "0.9rem" }}
			/>
		);
	},
);

export default AreaBonusControl;
