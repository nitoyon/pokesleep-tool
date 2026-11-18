import React from "react";
import { maxBerryZoneRate } from "../../../util/MainSkill";
import PercentSliderInput from "../../common/PercentSliderInput";

const BerryZoneControl = React.memo(
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
				max={maxBerryZoneRate}
				step={0.2}
				candidateStep={2}
				value={value}
				onChange={onChange}
				sx={{ width: "3.4rem", fontSize: "0.9rem" }}
			/>
		);
	},
);

export default BerryZoneControl;
