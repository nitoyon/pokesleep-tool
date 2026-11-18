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
import PercentSliderInput from "../../common/PercentSliderInput";
import SelectEx from "../../common/SelectEx";
import MessageDialog from "../../Dialog/MessageDialog";
import InfoButton from "../InfoButton";
import { LevelInput } from "../IvForm/LevelControl";

const RecipeBonusLevelForm = React.memo(
	({
		value,
		simple,
		onChange,
	}: {
		value: StrengthParameter;
		simple?: boolean;
		onChange: (value: StrengthParameter) => void;
	}) => {
		const { t } = useTranslation();
		const [recipeBonusHelpOpen, setRecipeBonusHelpOpen] = React.useState(false);
		const [recipeUsageHelpOpen, setRecipeUsageHelpOpen] = React.useState(false);

		const onRecipeBonusInfoClick = React.useCallback(() => {
			setRecipeBonusHelpOpen(true);
		}, []);
		const onRecipeBonusHelpClose = React.useCallback(() => {
			setRecipeBonusHelpOpen(false);
		}, []);
		const onRecipeUsageInfoClick = React.useCallback(() => {
			setRecipeUsageHelpOpen(true);
		}, []);
		const onRecipeUsageHelpClose = React.useCallback(() => {
			setRecipeUsageHelpOpen(false);
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
		const onHelpUsageChange = React.useCallback(
			(help: number) => {
				onChange({ ...value, recipeUsage: { ...value.recipeUsage, help } });
			},
			[onChange, value],
		);
		const onDrawUsageChange = React.useCallback(
			(draw: number) => {
				onChange({ ...value, recipeUsage: { ...value.recipeUsage, draw } });
			},
			[onChange, value],
		);
		const onPlusUsageChange = React.useCallback(
			(plus: number) => {
				onChange({ ...value, recipeUsage: { ...value.recipeUsage, plus } });
			},
			[onChange, value],
		);
		const onMagnetUsageChange = React.useCallback(
			(magnet: number) => {
				onChange({ ...value, recipeUsage: { ...value.recipeUsage, magnet } });
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
				<section>
					<span className="lbl">
						{t("recipe usage")}:<InfoButton onClick={onRecipeUsageInfoClick} />
					</span>
				</section>
				<section className="ml">
					<span className="lbl">{t("help")}:</span>
					<RecipeUsageInput
						value={value.recipeUsage.help}
						onChange={onHelpUsageChange}
					/>
				</section>
				{!simple && (
					<>
						<section className="ml">
							<span className="lbl">{t("skills.Ingredient Draw S.name")}:</span>
							<RecipeUsageInput
								value={value.recipeUsage.draw}
								onChange={onDrawUsageChange}
							/>
						</section>
						<section className="ml">
							<span className="lbl">
								{t("additional ingredients from plus")}:
							</span>
							<RecipeUsageInput
								value={value.recipeUsage.plus}
								onChange={onPlusUsageChange}
							/>
						</section>
						<section className="ml">
							<span className="lbl">
								{t("skills.Ingredient Magnet S.name")}:
							</span>
							<RecipeUsageInput
								value={value.recipeUsage.magnet}
								onChange={onMagnetUsageChange}
							/>
						</section>
					</>
				)}
				<RecipeBonusHelpDialog
					open={recipeBonusHelpOpen}
					onClose={onRecipeBonusHelpClose}
				/>
				<MessageDialog
					open={recipeUsageHelpOpen}
					onClose={onRecipeUsageHelpClose}
					message={t("recipe strength help")}
				/>
			</>
		);
	},
);

const RecipeUsageInput = React.memo(
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
				max={100}
				step={1}
				candidateStep={20}
				value={value}
				onChange={onChange}
				sx={{ width: "2.9rem", fontSize: "0.9rem" }}
			/>
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
