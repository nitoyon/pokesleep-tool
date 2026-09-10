import React from "react";
import { useTranslation } from "react-i18next";
import { NoTap } from "../../../util/Energy";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import TapFrequencyControl from "./TapFrequencyControl";

const TapFrequencyControlGroup = React.memo(
	({
		value,
		onChange,
		mt,
	}: {
		value: StrengthParameter;
		onChange: (value: StrengthParameter) => void;
		/** marginTop applied to the first section */
		mt?: string;
	}) => {
		const { t } = useTranslation();

		const onTapFrequencyAwakeChange = React.useCallback(
			(tapFrequencyAwake: number) => {
				onChange({ ...value, tapFrequencyAwake });
			},
			[onChange, value],
		);
		const onTapFrequencyAsleepChange = React.useCallback(
			(tapFrequencyAsleep: number) => {
				onChange({ ...value, tapFrequencyAsleep });
			},
			[onChange, value],
		);

		return (
			<>
				<section style={mt ? { marginTop: mt } : undefined}>
					<span className="lbl">
						{t("tap frequency")} ({t("awake")}):
					</span>
					<TapFrequencyControl
						max={10}
						value={value.tapFrequencyAwake}
						onChange={onTapFrequencyAwakeChange}
					/>
				</section>
				<section>
					<span className="lbl">
						{t("tap frequency")} ({t("asleep")}):
					</span>
					{value.tapFrequencyAwake === NoTap ? (
						<span style={{ fontSize: "0.9rem" }}>{t("none")}</span>
					) : (
						<TapFrequencyControl
							max={8}
							value={value.tapFrequencyAsleep}
							onChange={onTapFrequencyAsleepChange}
						/>
					)}
				</section>
			</>
		);
	},
);

export default TapFrequencyControlGroup;
