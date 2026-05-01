import React from "react";
import { styled } from "@mui/system";
import type { IvAction } from "../IvState";
import { useElementWidth } from "../../common/Hook";
import TapFrequencyControl from "../Strength/TapFrequencyControl";
import type PokemonIv from "../../../util/PokemonIv";
import type {
	StrengthParameter,
	StrengthResult,
} from "../../../util/PokemonStrength";
import { AmountOfSleep } from "../../../util/TimeUtil";
import { EnergyChart } from "../Chart/EnergyChart";
import { NoTap } from "../../../util/Energy";
import { clamp } from "../../../util/NumberUtil";
import {
	Collapse,
	MenuItem,
	Select,
	type SelectChangeEvent,
	Switch,
	TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const EnergyPanel = React.memo(
	({
		iv,
		result,
		parameter,
		dispatch,
	}: {
		iv: PokemonIv;
		result: StrengthResult;
		parameter: StrengthParameter;
		dispatch: React.Dispatch<IvAction>;
	}) => {
		const { t } = useTranslation();
		const [isScoreEmpty, setIsScoreEmpty] = React.useState(false);
		const [width, dialogRef] = useElementWidth();

		const onRestoreEnergyChange = React.useCallback(
			(e: SelectChangeEvent) => {
				dispatch({
					type: "changeParameter",
					payload: {
						parameter: {
							...parameter,
							e4eEnergy: parseInt(e.target.value, 10),
						},
					},
				});
			},
			[dispatch, parameter],
		);
		const onSkillCountChange = React.useCallback(
			(e: SelectChangeEvent) => {
				dispatch({
					type: "changeParameter",
					payload: {
						parameter: {
							...parameter,
							e4eCount: parseInt(e.target.value, 10),
						},
					},
				});
			},
			[dispatch, parameter],
		);
		const onRecoveryBonusCountChange = React.useCallback(
			(e: SelectChangeEvent) => {
				dispatch({
					type: "changeParameter",
					payload: {
						parameter: {
							...parameter,
							recoveryBonusCount: parseInt(e.target.value, 10) as
								| 0
								| 1
								| 2
								| 3
								| 4,
						},
					},
				});
			},
			[dispatch, parameter],
		);
		const onScoreChange = React.useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				setIsScoreEmpty(e.target.value === "");
				let newVal = parseInt(e.target.value, 10);
				if (Number.isNaN(newVal)) {
					newVal = 0;
				}
				newVal = clamp(0, newVal, 100);
				dispatch({
					type: "changeParameter",
					payload: {
						parameter: {
							...parameter,
							sleepScore: newVal,
						},
					},
				});
			},
			[dispatch, parameter],
		);
		const onAlways100Change = React.useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				dispatch({
					type: "changeParameter",
					payload: {
						parameter: {
							...parameter,
							isEnergyAlwaysFull: e.target.checked,
						},
					},
				});
			},
			[dispatch, parameter],
		);
		const onGoodCampTicketChange = React.useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				dispatch({
					type: "changeParameter",
					payload: {
						parameter: {
							...parameter,
							isGoodCampTicketSet: e.target.checked,
						},
					},
				});
			},
			[dispatch, parameter],
		);
		const onTapFrequencyAwakeChange = React.useCallback(
			(tapFrequencyAwake: number) => {
				dispatch({
					type: "changeParameter",
					payload: {
						parameter: {
							...parameter,
							tapFrequencyAwake,
						},
					},
				});
			},
			[dispatch, parameter],
		);
		const onTapFrequencyAsleepChange = React.useCallback(
			(tapFrequencyAsleep: number) => {
				dispatch({
					type: "changeParameter",
					payload: {
						parameter: {
							...parameter,
							tapFrequencyAsleep,
						},
					},
				});
			},
			[dispatch, parameter],
		);

		if (!open) {
			return null;
		}

		const hasRecoveryBonus = iv.hasEnergyRecoveryBonusInActiveSubSkills;
		const energy = result.energy;
		const carryLimit = result.carryLimit;

		return (
			<StyledEnergyPanel>
				<EnergyChart width={width} period={parameter.period} result={energy} />
				<Collapse in={!parameter.isEnergyAlwaysFull}>
					<section ref={dialogRef}>
						<div>
							<span className="lbl">
								{t("skills.Energy for Everyone S.name")}:
							</span>
							<div>
								<Select
									variant="standard"
									value={parameter.e4eEnergy.toString()}
									onChange={onRestoreEnergyChange}
								>
									<MenuItem value={5}>5</MenuItem>
									<MenuItem value={7}>7</MenuItem>
									<MenuItem value={9}>9</MenuItem>
									<MenuItem value={11}>11</MenuItem>
									<MenuItem value={15}>15</MenuItem>
									<MenuItem value={18}>18</MenuItem>
								</Select>
								<span style={{ margin: "0 0.5rem" }}>×</span>
								<Select
									variant="standard"
									value={parameter.e4eCount.toString()}
									onChange={onSkillCountChange}
								>
									<MenuItem value={0}>0</MenuItem>
									<MenuItem value={1}>1</MenuItem>
									<MenuItem value={2}>2</MenuItem>
									<MenuItem value={3}>3</MenuItem>
									<MenuItem value={4}>4</MenuItem>
									<MenuItem value={5}>5</MenuItem>
									<MenuItem value={6}>6</MenuItem>
									<MenuItem value={7}>7</MenuItem>
									<MenuItem value={8}>8</MenuItem>
									<MenuItem value={9}>9</MenuItem>
									<MenuItem value={10}>10</MenuItem>
								</Select>
							</div>
						</div>
						<div>
							<span className="lbl">
								{t("subskill.Energy Recovery Bonus")}:
							</span>
							<Select
								variant="standard"
								value={parameter.recoveryBonusCount.toString()}
								onChange={onRecoveryBonusCountChange}
							>
								<MenuItem value={0}>
									{hasRecoveryBonus ? "×1" : t("none")}
								</MenuItem>
								<MenuItem value={1}>{hasRecoveryBonus ? "×2" : "×1"}</MenuItem>
								<MenuItem value={2}>{hasRecoveryBonus ? "×3" : "×2"}</MenuItem>
								<MenuItem value={3}>{hasRecoveryBonus ? "×4" : "×3"}</MenuItem>
								<MenuItem value={4}>{hasRecoveryBonus ? "×5" : "×4"}</MenuItem>
							</Select>
						</div>
						<div>
							<span className="lbl">{t("sleep score")}:</span>
							<div>
								<TextField
									variant="standard"
									type="number"
									size="small"
									value={isScoreEmpty ? "" : parameter.sleepScore}
									onChange={onScoreChange}
									slotProps={{
										htmlInput: { min: 0, max: 100 },
									}}
								/>
							</div>
						</div>
					</section>
				</Collapse>
				<section>
					<div>
						<span className="lbl">{t("always 81%+")}:</span>
						<div>
							<Switch
								size="small"
								checked={parameter.isEnergyAlwaysFull}
								onChange={onAlways100Change}
							/>
						</div>
					</div>
				</section>
				<section>
					<div>
						<span className="lbl">{t("good camp ticket")}:</span>
						<div>
							<Switch
								size="small"
								checked={parameter.isGoodCampTicketSet}
								onChange={onGoodCampTicketChange}
							/>
						</div>
					</div>
				</section>
				<section>
					<div>
						<span className="lbl">
							{t("tap frequency")} ({t("awake")}):
						</span>
						<TapFrequencyControl
							max={10}
							value={parameter.tapFrequencyAwake}
							onChange={onTapFrequencyAwakeChange}
						/>
					</div>
					<div>
						<span className="lbl">
							{t("tap frequency")} ({t("asleep")}):
						</span>
						{parameter.tapFrequencyAwake === NoTap ? (
							<span style={{ fontSize: "0.9rem" }}>{t("none")}</span>
						) : (
							<TapFrequencyControl
								max={8}
								value={parameter.tapFrequencyAsleep}
								onChange={onTapFrequencyAsleepChange}
							/>
						)}
					</div>
				</section>
				<footer>
					<section className="first">
						<span className="lbl">{t("average help efficiency")}:</span>
						<div>{energy.averageEfficiency.total}</div>
						{parameter.period >= 24 && (
							<footer>
								<span>
									{t("awake")}: {energy.averageEfficiency.awake}
								</span>
								<span>
									{t("asleep")}: {energy.averageEfficiency.asleep}
								</span>
							</footer>
						)}
					</section>
					<Collapse in={energy.showSkillStock && parameter.period >= 24}>
						<section>
							<span className="lbl">{t("full inventory while sleeping")}:</span>
							<div>
								{result.timeToFullInventory < 0
									? t("none")
									: new AmountOfSleep(result.timeToFullInventory).toString(t)}
							</div>
							<footer>
								<span>
									{t("carry limit")}: {carryLimit}
								</span>
								<span>
									{t("sneaky snacking")}:{" "}
									{result.timeToFullInventory < 0
										? t("none")
										: result.total.sneakySnacking.toFixed(1) +
											" " +
											t("times unit")}
								</span>
							</footer>
						</section>
						<section>
							<span className="lbl">{t("skill trigger after wake up")}:</span>
							<div>
								{iv.pokemon.specialty !== "Skills" ? (
									<>
										{(result.skillProbabilityAfterWakeup.once * 100).toFixed(1)}
										%
									</>
								) : (
									<>
										❶
										{(result.skillProbabilityAfterWakeup.once * 100).toFixed(1)}
										% ❷
										{(result.skillProbabilityAfterWakeup.twice * 100).toFixed(
											1,
										)}
										%
									</>
								)}
							</div>
							<footer>
								<span>
									{t("lottery count")}: {result.asleep.normal.toFixed(2)}
								</span>
							</footer>
						</section>
					</Collapse>
				</footer>
				{iv.pokemon.skill === "Charge Energy S" && (
					<div className="warning">{t("charge energy not implemented")}</div>
				)}
			</StyledEnergyPanel>
		);
	},
);

const StyledEnergyPanel = styled("div")({
	width: "100%",
	"& section": {
		padding: "0 1rem",
		"& > div": {
			display: "flex",
			flex: "0 auto",
			flexWrap: "wrap",
			alignItems: "center",
			"& > span.lbl": {
				marginRight: "auto",
				fontSize: "0.9rem",
				"&.indent": {
					marginLeft: "1rem",
				},
			},
			"& .MuiSelect-select": {
				paddingTop: "1px",
				paddingBottom: "1px",
				fontSize: "0.9rem",
			},
			"& input.MuiInput-input": {
				fontSize: "0.9rem",
				paddingBottom: 0,
			},
		},
	},
	"& > footer": {
		margin: "0.5rem 1rem 0",
		fontSize: "0.9rem",
		background: "#eee",
		borderRadius: "0.9rem",
		padding: "0.5rem 0.7rem",
		"& section": {
			display: "grid",
			gridTemplateColumns: "1fr fit-content(200px)",
			marginTop: "0.4rem",
			"&.first": {
				marginTop: 0,
			},
			padding: 0,
			"& > div": {
				textAlign: "right",
			},
			"& > footer": {
				gridColumn: "1 / -1",
				color: "#666",
				fontSize: "0.7rem",
				marginLeft: "0.8rem",
				"& > span": {
					marginRight: "1rem",
				},
			},
		},
	},
	"& > div.warning": {
		fontSize: "0.8rem",
		color: "#666",
		padding: "0.4rem 1rem 0",
		marginLeft: "0.6rem",
	},
});

export default EnergyPanel;
