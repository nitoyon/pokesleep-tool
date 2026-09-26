import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import React from "react";
import { useTranslation } from "react-i18next";
import { formatWithComma, round1 } from "../../../util/NumberUtil";
import PokemonRp, { type RpStrengthResult } from "../../../util/PokemonRp";
import PokemonStrength, {
	createStrengthParameter,
	type StrengthParameter,
} from "../../../util/PokemonStrength";
import RaderChart from "../Chart/RaderChart";
import IngredientIcon from "../IngredientIcon";
import type IvState from "../IvState";
import BerryIngSkillView from "./BerryIngSkillView";
import RpInfoDialog from "./RpInfoDialog";
import RpLabel from "./RpLabel";
import RpValueDialog from "./RpValueDialog";

const RpView = React.memo(
	({ state, width }: { state: IvState; width: number }) => {
		const { t } = useTranslation();
		const [rpInfoOpen, setRpInfoOpen] = React.useState(false);
		const [rpValueOpen, setRpValueOpen] = React.useState(false);
		const [rpType, setRpType] = React.useState<
			"berry" | "ingredient" | "skill"
		>("berry");

		const onRpInfoClick = React.useCallback(() => {
			setRpInfoOpen(true);
		}, []);
		const onRpInfoClose = React.useCallback(() => {
			setRpInfoOpen(false);
		}, []);
		const onBerryInfoClick = React.useCallback(() => {
			setRpValueOpen(true);
			setRpType("berry");
		}, []);
		const onIngInfoClick = React.useCallback(() => {
			setRpValueOpen(true);
			setRpType("ingredient");
		}, []);
		const onSkillInfoClick = React.useCallback(() => {
			setRpValueOpen(true);
			setRpType("skill");
		}, []);
		const onRpValueClose = React.useCallback(() => {
			setRpValueOpen(false);
		}, []);

		const pokemonIv = state.pokemonIv;
		const rp = new PokemonRp(pokemonIv);
		const rpResult: RpStrengthResult = rp.calculate();

		// calculate using default config (note that we copy `mew` config
		// because RateNotFixedDialog is shown in RpView for Mew)
		const strengthParameter: StrengthParameter = createStrengthParameter({
			helpBonusCount: pokemonIv.hasHelpingBonusInActiveSubSkills ? 1 : 0,
		});
		const strength = new PokemonStrength(
			pokemonIv,
			strengthParameter,
		).calculate();

		const pokemon = rp.pokemon;
		const raderHeight = 400;
		const isError =
			state.lowerTabIndex === 1 &&
			state.selectedItemId >= 0 &&
			(state.parameter.level > 0 || state.parameter.fieldIndex >= 0);

		return (
			<>
				<div>
					<RpLabel
						rp={rpResult.rp}
						iv={pokemonIv}
						showIcon
						isError={isError}
						onClick={onRpInfoClick}
					/>
					<BerryIngSkillView
						berryValue={round1(rpResult.berryRp)}
						berryProb={round1(rp.iv.berryRate * 100)}
						berrySubValue={
							<>
								<LocalFireDepartmentIcon
									sx={{ color: "#ff944b", width: "1rem", height: "1rem" }}
								/>
								{formatWithComma(Math.round(strength.berryTotalStrength))}
							</>
						}
						onBerryInfoClick={onBerryInfoClick}
						ingredientValue={round1(rpResult.ingredientRp)}
						ingredientProb={round1(strength.ingRate * 100)}
						ingredientSubValue={strength.ingredients.map((x) => (
							<React.Fragment key={x.name}>
								<IngredientIcon name={x.name} />
								{round1(x.count)}
							</React.Fragment>
						))}
						onIngredientInfoClick={onIngInfoClick}
						skillValue={round1(rpResult.skillRp)}
						skillProb={round1(strength.skillRate * 100)}
						skillSubValue={strength.skillCount.toFixed(2) + t("times unit")}
						onSkillInfoClick={onSkillInfoClick}
					/>
					<RpInfoDialog
						isError={isError}
						level={state.parameter.level}
						fieldIndex={state.parameter.fieldIndex}
						open={rpInfoOpen}
						onClose={onRpInfoClose}
					/>
					<RpValueDialog
						open={rpValueOpen}
						onClose={onRpValueClose}
						rp={rp}
						rpResult={rpResult}
						rpType={rpType}
					/>
				</div>
				<RaderChart
					width={width}
					height={raderHeight}
					specialty={pokemon.specialty}
					berry={rpResult.berryRp / 2000}
					ingredient={rpResult.ingredientRp / 2000}
					skill={rpResult.skillRp / 2000}
				/>
			</>
		);
	},
);

export default RpView;
