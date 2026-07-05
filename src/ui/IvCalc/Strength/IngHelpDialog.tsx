import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import type i18next from "i18next";
import React from "react";
import { useTranslation } from "react-i18next";
import { getEventBonus } from "../../../data/events";
import { NoTap } from "../../../util/Energy";
import {
	formatNice,
	formatWithComma,
	round1,
	round2,
} from "../../../util/NumberUtil";
import { ingredientStrength } from "../../../util/PokemonRp";
import type PokemonStrength from "../../../util/PokemonStrength";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import {
	type IngredientStrength,
	recipeLevelBonus,
	type StrengthResult,
} from "../../../util/PokemonStrength";
import IngredientCountIcon from "../IngredientCountIcon";
import IngredientIcon from "../IngredientIcon";
import type { IvAction } from "../IvState";
import RecipeBonusLevelForm from "../Panel/RecipeBonusLevelForm";
import { StyledInfoDialog } from "./StrengthBerryIngSkillView";

const IngHelpDialog = React.memo(
	({
		open,
		strength,
		result,
		dispatch,
		onClose,
	}: {
		open: boolean;
		strength: PokemonStrength;
		result: StrengthResult;
		dispatch: React.Dispatch<IvAction>;
		onClose: () => void;
	}) => {
		const { t } = useTranslation();
		const onChange = React.useCallback(
			(value: StrengthParameter) => {
				dispatch({ type: "changeParameter", payload: { parameter: value } });
			},
			[dispatch],
		);

		if (!open) {
			return null;
		}

		const param = strength.parameter;
		if (param.tapFrequencyAwake === NoTap) {
			return (
				<Dialog open={open} onClose={onClose}>
					<DialogContent
						style={{ fontSize: "0.95rem", whiteSpace: "pre-wrap" }}
					>
						{t("no ingredient")}
					</DialogContent>

					<DialogActions>
						<Button onClick={onClose}>{t("close")}</Button>
					</DialogActions>
				</Dialog>
			);
		}

		const ings = result.ingredients;
		const ingInRecipeStrengthRate =
			param.recipeBonus === 0
				? 1
				: (1 + param.recipeBonus / 100) *
					(1 + recipeLevelBonus[param.recipeLevel] / 100);
		const recipeRate = ingInRecipeStrengthRate * 0.8 + 0.2;
		const dishBonus = getEventBonus(param.event, param.customEventBonus).dish;

		return (
			<StyledInfoDialog open={open} onClose={onClose}>
				<DialogTitle>
					<article>
						<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
						{formatWithComma(Math.round(result.ingStrength))}
					</article>
				</DialogTitle>
				<DialogContent>
					<div className={`inggrid ings${ings.length}`}>
						{getIngDetail(strength, result, recipeRate, ings[0], t)}
						{ings.length > 1 &&
							getIngDetail(strength, result, recipeRate, ings[1], t)}
						{ings.length > 2 &&
							getIngDetail(strength, result, recipeRate, ings[2], t)}
					</div>
					<article>
						<div>
							<span className="box box3">{round2(result.ingHelpCount)}</span>
						</div>
						<span>{t("ing help count")}</span>
						<footer>
							{round1(result.total.normal)}
							<small> ({t("normal help count")})</small>
							<> × </>
							{round1(result.ingRate * 100)}%
							<small> ({t("ingredient rate")})</small>
						</footer>
						<div>
							<span className="box box7">{round2(ings[0].overflowCount)}</span>
						</div>
						<span>{t("inventory full lost")}</span>
						<div>
							<span className="box box1">{round1(ings[0].count)}</span>
						</div>
						<span>{t("ing count")}</span>
						<div>
							<span className="box box2">
								{ingredientStrength[ings[0].name]}
							</span>
						</div>
						<span>{t("strength per ing")}</span>
						<div>
							<span className="box box5">{round2(recipeRate)}</span>
						</div>
						<span>{t("recipe multiplier")}</span>
						<footer>
							<>(</>
							{round2(
								param.recipeBonus === 0 ? 1 : 1 + param.recipeBonus / 100,
							)}
							<small> ({t("recipe bonus")})</small>
							<> × </>
							{round2(1 + recipeLevelBonus[param.recipeLevel] / 100)}
							<small>({t("average recipe level")})</small>
							<>) × 0.8 + 0.2</>
						</footer>
						<div>
							<span className="box box4">{param.fieldBonus}%</span>
						</div>
						<span>{t("area bonus")}</span>
						{dishBonus !== 1 && (
							<>
								<div>
									<span className="box box6">{dishBonus}</span>
								</div>
								<span>{t("event bonus")}</span>
							</>
						)}
					</article>
					<RecipeBonusLevelForm
						value={strength.parameter}
						onChange={onChange}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>{t("close")}</Button>
				</DialogActions>
			</StyledInfoDialog>
		);
	},
);

function getIngDetail(
	strength: PokemonStrength,
	result: StrengthResult,
	recipeRatio: number,
	ing: IngredientStrength,
	t: typeof i18next.t,
): React.ReactNode {
	if (strength.parameter.tapFrequencyAwake === NoTap) {
		return <article>ー</article>;
	}

	const count = ing.count;
	const ingSlot =
		1 + (result.ing2.count > 0 ? 1 : 0) + (result.ing3.count > 0 ? 1 : 0);
	const ingName = ing.name;
	const param = strength.parameter;
	const dishBonus = getEventBonus(param.event, param.customEventBonus).dish;

	return (
		<>
			<span>
				<IngredientIcon name={ing.name} />
				{round1(count)}
			</span>
			<div>
				<span className="box box3">{round2(result.ingHelpCount)}</span> ×{" "}
				{ing.slots.length > 1 ? "(" : ""}
				{ing.slots.map((ing, i) => (
					<span key={`${ingName}x${ing.count}`}>
						{i === 0 ? "" : " + "}
						<IngredientCountIcon count={ing.count} name={ingName} />
					</span>
				))}
				{ing.slots.length > 1 ? ")" : ""}
				{ingSlot > 1 ? ` / ${ingSlot}` : ""} -{" "}
				<span className="box box7">{round2(ing.overflowCount)}</span>
			</div>
			<span style={{ marginTop: "-0.5rem" }}>
				<LocalFireDepartmentIcon
					sx={{ color: "#ff944b" }}
					className="strength"
				/>
				{formatNice(ing.strength, t)}
			</span>
			<div style={{ marginTop: "-0.5rem" }}>
				<span className="box box1">{round1(count)}</span> ×{" "}
				<span className="box box2">{ingredientStrength[ingName]}</span> ×{" "}
				<span className="box box5">{round2(recipeRatio)}</span> ×{" "}
				<span>
					<>(1+</>
					<span className="box box4">{param.fieldBonus}%</span>
					<>)</>
				</span>
				{dishBonus !== 1 && (
					<>
						{" "}
						× <span className="box box6">{dishBonus}</span>
					</>
				)}
			</div>
		</>
	);
}

export default IngHelpDialog;
