import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { formatWithComma, round1 } from "../../../util/NumberUtil";
import type PokemonStrength from "../../../util/PokemonStrength";
import type {
	StrengthParameter,
	StrengthResult,
} from "../../../util/PokemonStrength";
import InfoButton from "../InfoButton";
import type { IvAction } from "../IvState";
import BerryStrengthDialog from "./BerryStrengthDialog";
import { StyledInfoDialog } from "./StrengthBerryIngSkillView";
import TapFrequencyControlGroup from "./TapFrequencyControlGroup";

const BerryHelpDialog = React.memo(
	({
		open,
		onClose,
		dispatch,
		strength,
		result,
	}: {
		open: boolean;
		onClose: () => void;
		dispatch: React.Dispatch<IvAction>;
		strength: PokemonStrength;
		result: StrengthResult;
	}) => {
		const { t } = useTranslation();
		const [berryStrengthOpen, setBerryStrengthOpen] = React.useState(false);
		const onBerryStrengthInfoClick = React.useCallback(() => {
			setBerryStrengthOpen(true);
		}, []);
		const onBerryStrengthInfoClose = React.useCallback(() => {
			setBerryStrengthOpen(false);
		}, []);

		const parameter = strength.parameter;
		const onParameterChange = React.useCallback(
			(parameter: StrengthParameter) => {
				dispatch({ type: "changeParameter", payload: { parameter } });
			},
			[dispatch],
		);

		if (!open) {
			return null;
		}

		const param = strength.parameter;
		const berryStrength = Math.ceil(
			result.berryStrength * strength.berryStrengthBonus,
		);
		const hasBerryCountBonus = result.bonus.berry > 0;
		return (
			<StyledInfoDialog open={open} onClose={onClose}>
				<DialogTitle>
					<article>
						<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
						{formatWithComma(Math.round(result.berryTotalStrength))}
					</article>
					<footer>
						<span className="box box1">{berryStrength}</span> ×{" "}
						<span className="box box2">{result.berryCountPerNormalHelp}</span> ×{" "}
						{!hasBerryCountBonus && (
							<span className="box box3">{round1(result.berryHelpCount)}</span>
						)}
						{hasBerryCountBonus && (
							<>
								<span className="box box3">
									{round1(result.berryNormalHelpCount)}
								</span>
								<br /> + <span className="box box1">{berryStrength}</span> ×{" "}
								<span className="box box2">
									{result.berryCountPerSneakySnacking}
								</span>{" "}
								×{" "}
								<span className="box box3">
									{round1(result.total.sneakySnacking)}
								</span>
							</>
						)}
					</footer>
				</DialogTitle>
				<DialogContent>
					<article>
						<div>
							<span className="box box1">{berryStrength}</span>
						</div>
						<span>
							{t("actual berry strength")}
							<InfoButton onClick={onBerryStrengthInfoClick} />
						</span>
						<div>
							<span className="box box2">{result.berryCountPerNormalHelp}</span>
						</div>
						<span>{t("berry count")}</span>
						<div>
							<span className="box box3">
								{hasBerryCountBonus
									? round1(result.berryHelpCount)
									: round1(result.berryNormalHelpCount)}
							</span>
						</div>
						<span>
							{t("berry help count")}
							<ul className="detail">
								<li>
									<strong>
										{round1(result.total.normal * result.berryRate)}
									</strong>
									{t("times unit")}: {t("berry picking count")}
									<footer>
										{round1(result.total.normal)}
										<small> ({t("normal help count")})</small>
										<> × </>
										{round1(result.berryRate * 100)}%
										<small> ({t("berry rate")})</small>
									</footer>
								</li>
								<li>
									<strong>{round1(result.total.sneakySnacking)}</strong>
									{t("times unit")}: {t("sneaky snacking")}
									<footer>
										{t("awake")}: {round1(result.awake.sneakySnacking)}
										{t("times unit")}
										<br />
										{t("asleep")}: {round1(result.asleep.sneakySnacking)}
										{t("times unit")}
										<br />
									</footer>
								</li>
							</ul>
						</span>
					</article>
					{parameter.period > 0 && (
						<TapFrequencyControlGroup
							value={parameter}
							onChange={onParameterChange}
							mt="1.8rem"
						/>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>{t("close")}</Button>
				</DialogActions>
				<BerryStrengthDialog
					open={berryStrengthOpen}
					onClose={onBerryStrengthInfoClose}
					iv={strength.pokemonIv}
					fieldBonus={param.fieldBonus}
					berryStrengthMultiplier={strength.berryStrengthBonus}
				/>
			</StyledInfoDialog>
		);
	},
);

export default BerryHelpDialog;
