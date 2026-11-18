import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	FormControl,
	MenuItem,
	Typography,
} from "@mui/material";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import SelectEx from "../../common/SelectEx";
import InfoButton from "../InfoButton";
import { LevelInput } from "../IvForm/LevelControl";

const RecipeBonusLevelForm = React.memo(
	({
		value,
		onChange,
	}: {
		value: StrengthParameter;
		onChange: (value: StrengthParameter) => void;
	}) => {
		const { t } = useTranslation();
		const [recipeBonusHelpOpen, setRecipeBonusHelpOpen] = React.useState(false);

		const onRecipeBonusInfoClick = React.useCallback(() => {
			setRecipeBonusHelpOpen(true);
		}, []);
		const onRecipeBonusHelpClose = React.useCallback(() => {
			setRecipeBonusHelpOpen(false);
		}, []);
		const onRecipeBonusChange = React.useCallback(
			(recipeBonus: number) => {
				onChange({ ...value, recipeBonus });
			},
			[onChange, value],
		);
		const onRecipeLevelChange = React.useCallback(
			(recipeLevel: number) => {
				onChange({ ...value, recipeLevel });
			},
			[onChange, value],
		);

		return (
			<>
				<section className="mt">
					<span className="lbl">
						{t("recipe bonus")}:<InfoButton onClick={onRecipeBonusInfoClick} />
					</span>
					<RecipeBonusSelect
						value={value.recipeBonus}
						onChange={onRecipeBonusChange}
					/>
				</section>
				<section>
					<span className="lbl">{t("average recipe level")}:</span>
					<LevelInput
						value={value.recipeLevel}
						onChange={onRecipeLevelChange}
						showSlider
						sx={{ width: "2rem" }}
					/>
				</section>
				<RecipeBonusHelpDialog
					open={recipeBonusHelpOpen}
					onClose={onRecipeBonusHelpClose}
				/>
			</>
		);
	},
);

const RecipeBonusSelect = React.memo(
	({
		value,
		onChange,
	}: {
		value: number;
		onChange: (value: number) => void;
	}) => {
		const { t } = useTranslation();

		const onSelectChange = React.useCallback(
			(val: string) => {
				onChange(parseInt(val, 10));
			},
			[onChange],
		);

		return (
			<FormControl size="small">
				<SelectEx value={value.toString()} onChange={onSelectChange}>
					<MenuItem value="0" dense>
						0%{" "}
						<small style={{ paddingLeft: "0.3rem" }}>
							({t("mixed recipe")})
						</small>
					</MenuItem>
					<MenuItem value="19" dense>
						19%{" "}
						<small style={{ paddingLeft: "0.3rem" }}>
							(7{t("range separator")}16 {t("ingredients unit")})
						</small>
					</MenuItem>
					<MenuItem value="20" dense>
						20%{" "}
						<small style={{ paddingLeft: "0.3rem" }}>
							(20{t("range separator")}22 {t("ingredients unit")})
						</small>
					</MenuItem>
					<MenuItem value="21" dense>
						21%{" "}
						<small style={{ paddingLeft: "0.3rem" }}>
							(23{t("range separator")}26 {t("ingredients unit")})
						</small>
					</MenuItem>
					<MenuItem value="25" dense>
						25%{" "}
						<small style={{ paddingLeft: "0.3rem" }}>
							(17{t("range separator")}35 {t("ingredients unit")})
						</small>
					</MenuItem>
					<MenuItem value="35" dense>
						35%{" "}
						<small style={{ paddingLeft: "0.3rem" }}>
							(35{t("range separator")}56 {t("ingredients unit")})
						</small>
					</MenuItem>
					<MenuItem value="48" dense>
						48%{" "}
						<small style={{ paddingLeft: "0.3rem" }}>
							(49{t("range separator")}77 {t("ingredients unit")})
						</small>
					</MenuItem>
					<MenuItem value="61" dense>
						61%{" "}
						<small style={{ paddingLeft: "0.3rem" }}>
							(78{t("range separator")}102 {t("ingredients unit")})
						</small>
					</MenuItem>
					<MenuItem value="78" dense>
						78%{" "}
						<small style={{ paddingLeft: "0.3rem" }}>
							(103{t("range separator")}115 {t("ingredients unit")})
						</small>
					</MenuItem>
					<MenuItem value="82" dense>
						82%{" "}
						<small style={{ paddingLeft: "0.3rem" }}>
							(121{t("range separator")} {t("ingredients unit")})
						</small>
					</MenuItem>
				</SelectEx>
			</FormControl>
		);
	},
);

const RecipeBonusHelpDialog = React.memo(
	({ open, onClose }: { open: boolean; onClose: () => void }) => {
		const { t } = useTranslation();

		return (
			<Dialog open={open} onClose={onClose}>
				<DialogContent>
					<Typography
						sx={{
							marginBottom: "16px",
						}}
					>
						<Trans
							i18nKey="recipe bonus help"
							components={{
								raenonx: <a href={t("recipe bonus list")}>raenonx</a>,
							}}
						/>
					</Typography>
					<Typography variant="body2">{t("recipe strength help")}</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>{t("close")}</Button>
				</DialogActions>
			</Dialog>
		);
	},
);

export default RecipeBonusLevelForm;
