import { Switch } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import MessageDialog from "../../Dialog/MessageDialog";
import InfoButton from "../InfoButton";
import type { IvAction } from "../IvState";
import FixedLevelSelect from "./FixedLevelSelect";

const LevelEvolvedControlGroup = React.memo(
	({
		dispatch,
		value,
		onChange,
	}: {
		dispatch: React.Dispatch<IvAction>;
		value: StrengthParameter;
		onChange: (value: StrengthParameter) => void;
	}) => {
		const { t } = useTranslation();
		const [helpOpen, setHelpOpen] = React.useState(false);

		const onEvolvedChange = React.useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				onChange({ ...value, evolved: e.target.checked });
			},
			[onChange, value],
		);
		const onMaxSkillLevelChange = React.useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				onChange({ ...value, maxSkillLevel: e.target.checked });
			},
			[onChange, value],
		);
		const onPityProcChange = React.useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				onChange({ ...value, pityProc: e.target.checked });
			},
			[onChange, value],
		);

		const onPityProcHelpClick = React.useCallback(() => {
			setHelpOpen(true);
		}, []);

		const onPityProcHelpClose = React.useCallback(() => {
			setHelpOpen(false);
		}, []);

		return (
			<>
				<section className="mt">
					<span className="lbl">{t("level")}:</span>
					<FixedLevelSelect dispatch={dispatch} value={value} />
				</section>
				<section>
					<span className="lbl">{t("calc with evolved")}:</span>
					<Switch checked={value.evolved} onChange={onEvolvedChange} />
				</section>
				<section>
					<span className="lbl">{t("calc with max skill level")}:</span>
					<Switch
						checked={value.maxSkillLevel}
						onChange={onMaxSkillLevelChange}
					/>
				</section>
				<section>
					<span className="lbl">
						{t("include pity proc")}:
						<InfoButton onClick={onPityProcHelpClick} />
					</span>
					<Switch checked={value.pityProc} onChange={onPityProcChange} />
				</section>
				<MessageDialog
					open={helpOpen}
					onClose={onPityProcHelpClose}
					message={
						<>
							<p>{t("pity proc help")}</p>
							<p>{t("pity proc help2")}</p>
						</>
					}
				/>
			</>
		);
	},
);

export default LevelEvolvedControlGroup;
