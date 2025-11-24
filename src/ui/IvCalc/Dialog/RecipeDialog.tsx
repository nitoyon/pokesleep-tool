import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import recipes, { type Recipe } from "../../../data/recipes";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import IngredientIcon from "../IngredientIcon";

const RecipeDialog = React.memo(
	({
		open,
		value,
		onChange,
		onClose,
	}: {
		open: boolean;
		value: StrengthParameter;
		onChange: (value: StrengthParameter) => void;
		onClose: () => void;
	}) => {
		const { t } = useTranslation();

		const onSelect = React.useCallback(
			(recipe: Recipe) => {
				onChange({ ...value, recipeBonus: recipe.bonus });
				onClose();
			},
			[onChange, onClose, value],
		);

		const buttons = recipes.map((x) => (
			<RecipeButton key={x.key} recipe={x} onSelect={onSelect} />
		));

		return (
			<Dialog open={open} onClose={onClose}>
				<DialogContent>
					<article>{buttons}</article>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>{t("close")}</Button>
				</DialogActions>
			</Dialog>
		);
	},
);

const RecipeButton = React.memo(
	({
		recipe,
		onSelect,
	}: {
		recipe: Recipe;
		onSelect: (recipe: Recipe) => void;
	}) => {
		const { t } = useTranslation();
		const name = t(`recipe.${recipe.key}`);
		const onClick = React.useCallback(() => {
			onSelect(recipe);
		}, [onSelect, recipe]);

		const counts = React.useMemo(
			() =>
				recipe.ings.map((ing) => (
					<React.Fragment key={ing.ing}>
						<IngredientIcon name={ing.ing} />
						{ing.count}
					</React.Fragment>
				)),
			[recipe],
		);

		return (
			<StyledRecipeButton onClick={onClick}>
				<h2>{name}</h2>
				<footer>{counts}</footer>
			</StyledRecipeButton>
		);
	},
);

const StyledRecipeButton = styled(Button)({
	display: "block",
	margin: "0 0 8px 0",
	padding: "0.2rem 0.4rem",
	border: "1px solid #fec34e",
	borderRadius: 8,
	width: "100%",
	textAlign: "left",
	color: "#000",
	"& > h2": {
		fontSize: "0.8rem",
		fontWeight: 400,
		margin: 0,
	},
	"& > footer": {
		display: "flex",
		alignItems: "center",
		"& > svg": {
			width: "0.7rem",
			height: "0.7rem",
			padding: "0 0.2rem 0 0.5rem",
			"&:first-of-type": {
				paddingLeft: 0,
			},
		},
		fontSize: "0.7rem",
	},
});

export default RecipeDialog;
