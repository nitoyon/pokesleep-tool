import {
	Button,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	MenuItem,
	Switch,
	Tab,
	Tabs,
} from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { whistlePeriod } from "../../../util/Energy";
import { clamp } from "../../../util/NumberUtil";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import { maxNcpLevel } from "../../../util/StrengthParameter";
import CollapseEx from "../../common/CollapseEx";
import DraggableTabContainer from "../../common/DraggableTabContainer";
import { useElementWidth } from "../../common/Hook";
import NumericSliderInput from "../../common/NumericSliderInput";
import SelectEx from "../../common/SelectEx";
import type { IvAction } from "../IvState";
import BerryZoneForm from "../Panel/BerryZoneForm";
import RecipeBonusLevelForm from "../Panel/RecipeBonusLevelForm";
import AreaControlGroup from "../Strength/AreaControlGroup";
import EventSelectControl from "../Strength/EventSelectControl";
import LevelEvolvedControlGroup from "../Strength/LevelEvolvedControlGroup";
import PeriodSelect from "../Strength/PeriodSelect";
import TapFrequencyControlGroup from "../Strength/TapFrequencyControlGroup";

const TeamParameterDialog = React.memo(
	({
		value,
		dispatch,
		open,
		onClose,
	}: {
		value: StrengthParameter;
		dispatch: (action: IvAction) => void;
		open: boolean;
		onClose: () => void;
	}) => {
		const [tabIndex, setTabIndex] = React.useState(0);
		const [width, elementRef] = useElementWidth(0);
		const { t } = useTranslation();

		const onTabChange = React.useCallback(
			(_event: React.SyntheticEvent, newValue: number) => {
				setTabIndex(newValue);
			},
			[],
		);

		return (
			<StyledDialog open={open} onClose={onClose} fullWidth>
				<DialogContent>
					<StyledTabs
						variant="scrollable"
						scrollButtons
						ref={elementRef}
						value={tabIndex}
						onChange={onTabChange}
					>
						<StyledTab label={t("parameter")} value={0} />
						<StyledTab label={t("research area")} value={1} />
						<StyledTab label="GO Plus +" value={2} />
					</StyledTabs>
					{/* render after width has been detected */}
					{width > 0 && (
						<DraggableTabContainer
							index={tabIndex}
							width={width}
							onChange={setTabIndex}
						>
							<CalculatePanel value={value} dispatch={dispatch} />
							<AreaPanel value={value} dispatch={dispatch} />
							<GoPlusPanel value={value} dispatch={dispatch} />
						</DraggableTabContainer>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>{t("close")}</Button>
				</DialogActions>
			</StyledDialog>
		);
	},
);

const StyledDialog = styled(Dialog)({
	"& > div.MuiDialog-container > div.MuiPaper-root": {
		width: "100%",
		margin: "20px",
		maxHeight: "calc(100% - 20px)",
	},
	"& .MuiDialogContent-root": {
		padding: "0 1rem 1rem",
		"& section": {
			margin: "0.2rem 0",
			fontSize: ".9rem",
			display: "flex",
			flex: "0 auto",
			"&.mt": {
				marginTop: "1rem",
			},
			"&.ml": {
				marginLeft: "1rem",
			},
			"& > span.lbl": {
				marginRight: "auto",
				marginTop: 0,
				textWrap: "wrap",
			},
			"& > span > button": {
				marginRight: 0,
			},
			"& > .MuiInput-underline": {
				fontSize: "0.9rem",
			},
			"& div.MuiToggleButtonGroup-root > button": {
				fontSize: "0.75rem",
				padding: "0.5rem 0.2rem",
				lineHeight: 1.1,
				maxWidth: "7rem",
			},
		},
	},
});

const StyledTabs = styled(Tabs)({
	minHeight: "36px",
	marginBottom: ".7rem",
});
const StyledTab = styled(Tab)({
	minHeight: "36px",
	minWidth: "0",
	textTransform: "none",
});

const CalculatePanel = React.memo(
	({
		value,
		dispatch,
	}: {
		value: StrengthParameter;
		dispatch: (action: IvAction) => void;
	}) => {
		const { t } = useTranslation();

		const onChange = React.useCallback(
			(value: StrengthParameter) => {
				dispatch({ type: "changeParameter", payload: { parameter: value } });
			},
			[dispatch],
		);
		const onScoreChange = React.useCallback(
			(sleepScore: number) => {
				sleepScore = clamp(0, sleepScore, 100);
				onChange({
					...value,
					sleepScore,
				});
			},
			[onChange, value],
		);
		const onAlwaysFullChange = React.useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				onChange({
					...value,
					isEnergyAlwaysFull: e.target.checked,
				});
			},
			[onChange, value],
		);

		const isNotWhistle = value.period !== whistlePeriod;

		return (
			<div className="tabChild">
				<section>
					<span className="lbl">{t("period")}:</span>
					<PeriodSelect dispatch={dispatch} value={value} />
				</section>
				<Collapse in={isNotWhistle}>
					<TapFrequencyControlGroup
						value={value}
						onChange={onChange}
						mt="1rem"
					/>
				</Collapse>
				<LevelEvolvedControlGroup
					dispatch={dispatch}
					value={value}
					onChange={onChange}
				/>
				<section className="mt">
					<span className="lbl">{t("energy")}:</span>
					<div />
				</section>
				<section className="ml">
					<span className="lbl">{t("sleep score")}:</span>
					<NumericSliderInput
						value={value.sleepScore}
						onChange={onScoreChange}
						sx={{ width: "2rem", fontSize: "0.9rem" }}
						min={0}
						max={100}
					/>
				</section>
				<section className="ml">
					<span className="lbl">{t("always 81%+")}:</span>
					<Switch
						size="small"
						checked={value.isEnergyAlwaysFull}
						onChange={onAlwaysFullChange}
					/>
				</section>
				<RecipeBonusLevelForm value={value} onChange={onChange} />
			</div>
		);
	},
);

const AreaPanel = React.memo(
	({
		value,
		dispatch,
	}: {
		value: StrengthParameter;
		dispatch: (action: IvAction) => void;
	}) => {
		const { t } = useTranslation();

		const onChange = React.useCallback(
			(value: StrengthParameter) => {
				dispatch({ type: "changeParameter", payload: { parameter: value } });
			},
			[dispatch],
		);

		return (
			<div className="tabChild">
				<AreaControlGroup value={value} onChange={onChange} />
				<section className="mt">
					<span className="lbl">{t("event")}:</span>
					<EventSelectControl value={value} onChange={onChange} />
				</section>
				<BerryZoneForm value={value} onChange={onChange} />
			</div>
		);
	},
);

const GoPlusPanel = React.memo(
	({
		value,
		dispatch,
	}: {
		value: StrengthParameter;
		dispatch: (action: IvAction) => void;
	}) => {
		const { t } = useTranslation();

		const onChange = React.useCallback(
			(value: StrengthParameter) => {
				dispatch({ type: "changeParameter", payload: { parameter: value } });
			},
			[dispatch],
		);

		const onGoPlusPlusChange = React.useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				onChange({
					...value,
					ncp: e.target.checked,
				});
			},
			[onChange, value],
		);
		const onNcpLevelChange = React.useCallback(
			(ncpLevel: number) => {
				onChange({
					...value,
					ncpLevel,
				});
			},
			[onChange, value],
		);
		const onNcpSpinChange = React.useCallback(
			(ncpSpin: string) => {
				onChange({
					...value,
					ncpSpin: parseInt(ncpSpin, 10),
				});
			},
			[onChange, value],
		);

		return (
			<div className="tabChild">
				<section className="first">
					<span className="lbl">Pokémon GO Plus +:</span>
					<Switch
						size="small"
						checked={value.ncp}
						onChange={onGoPlusPlusChange}
					/>
				</section>
				<CollapseEx show={value.ncp}>
					<section className="ml">
						<span className="lbl">{t("level")}:</span>
						<NumericSliderInput
							sx={{ width: "2rem", fontSize: "0.9rem", padding: 0 }}
							value={value.ncpLevel}
							min={1}
							max={maxNcpLevel}
							onChange={onNcpLevelChange}
						/>
					</section>
					<section className="ml">
						<span className="lbl">{t("pokestop spin")}:</span>
						<SelectEx
							value={value.ncpSpin}
							onChange={onNcpSpinChange}
							sx={{ minWidth: "1.5rem" }}
						>
							<MenuItem value={0}>0</MenuItem>
							<MenuItem value={1}>1{t("range separator")}7</MenuItem>
							<MenuItem value={8}>8{t("range separator")}15</MenuItem>
							<MenuItem value={16}>16{t("range separator")}23</MenuItem>
							<MenuItem value={24}>24{t("range separator")}31</MenuItem>
							<MenuItem value={32}>32{t("range separator")}</MenuItem>
						</SelectEx>
					</section>
				</CollapseEx>
			</div>
		);
	},
);

export default TeamParameterDialog;
