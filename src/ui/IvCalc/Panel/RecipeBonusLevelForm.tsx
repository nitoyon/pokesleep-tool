import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	FormControl,
	MenuItem,
	Select,
	type SelectChangeEvent,
	Typography,
} from "@mui/material";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import type { StrengthParameter } from "../../../util/PokemonStrength";
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
			(e: SelectChangeEvent) => {
				onChange({ ...value, recipeBonus: parseInt(e.target.value, 10) });
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
					<FormControl size="small">
						<Select
							variant="standard"
							value={value.recipeBonus.toString()}
							onChange={onRecipeBonusChange}
						>
							<MenuItem value={0}>
								0%{" "}
								<small style={{ paddingLeft: "0.3rem" }}>
									({t("mixed recipe")})
								</small>
							</MenuItem>
							<MenuItem value={19}>
								19%{" "}
								<small style={{ paddingLeft: "0.3rem" }}>
									(7{t("range separator")}16 {t("ingredients unit")})
								</small>
							</MenuItem>
							<MenuItem value={20}>
								20%{" "}
								<small style={{ paddingLeft: "0.3rem" }}>
									(20{t("range separator")}22 {t("ingredients unit")})
								</small>
							</MenuItem>
							<MenuItem value={21}>
								21%{" "}
								<small style={{ paddingLeft: "0.3rem" }}>
									(23{t("range separator")}26 {t("ingredients unit")})
								</small>
							</MenuItem>
							<MenuItem value={25}>
								25%{" "}
								<small style={{ paddingLeft: "0.3rem" }}>
									(17{t("range separator")}35 {t("ingredients unit")})
								</small>
							</MenuItem>
							<MenuItem value={35}>
								35%{" "}
								<small style={{ paddingLeft: "0.3rem" }}>
									(35{t("range separator")}56 {t("ingredients unit")})
								</small>
							</MenuItem>
							<MenuItem value={48}>
								48%{" "}
								<small style={{ paddingLeft: "0.3rem" }}>
									(49{t("range separator")}77 {t("ingredients unit")})
								</small>
							</MenuItem>
							<MenuItem value={61}>
								61%{" "}
								<small style={{ paddingLeft: "0.3rem" }}>
									(78{t("range separator")}102 {t("ingredients unit")})
								</small>
							</MenuItem>
							<MenuItem value={78}>
								78%{" "}
								<small style={{ paddingLeft: "0.3rem" }}>
									(103{t("range separator")}115 {t("ingredients unit")})
								</small>
							</MenuItem>
						</Select>
					</FormControl>
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
				{value.recipeLevel >= 68 && (
					<p style={{ fontSize: "0.8rem", color: "#666", textAlign: "right" }}>
						{t("estimated beyond level", { level: 68 })}
					</p>
				)}
				<RecipeBonusHelpDialog
					open={recipeBonusHelpOpen}
					onClose={onRecipeBonusHelpClose}
				/>
			</>
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
