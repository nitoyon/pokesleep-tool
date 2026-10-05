import React from "react";
import { useTranslation } from "react-i18next";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import BerryZoneControl from "../Strength/BerryZoneControl";

const BerryZoneForm = React.memo(
	({
		value,
		onChange,
	}: {
		value: StrengthParameter;
		onChange: (value: StrengthParameter) => void;
	}) => {
		const { t } = useTranslation();

		const onBerryZoneChange = React.useCallback(
			(newValue: number) => {
				onChange({
					...value,
					berryZone: { psychic: newValue },
				});
			},
			[onChange, value],
		);

		return (
			<section className="mt">
				<span className="lbl">
					{t("skills.Berry Zone.name")} ({t("types.psychic")}):
				</span>
				<BerryZoneControl
					value={value.berryZone.psychic}
					onChange={onBerryZoneChange}
				/>
			</section>
		);
	},
);

export default BerryZoneForm;
