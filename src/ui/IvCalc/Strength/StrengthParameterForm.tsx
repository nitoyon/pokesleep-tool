import {
	Button,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	MenuItem,
	Select,
	type SelectChangeEvent,
	Snackbar,
	Switch,
} from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { whistlePeriod } from "../../../util/Energy";
import type { PokemonBoxItem } from "../../../util/PokemonBox";
import {
	createStrengthParameter,
	type StrengthParameter,
} from "../../../util/PokemonStrength";
import MessageDialog from "../../Dialog/MessageDialog";
import InfoButton from "../InfoButton";
import type { IvAction } from "../IvState";
import OtherTeamMemberForm from "../Panel/OtherTeamMemberForm";
import RecipeBonusLevelForm from "../Panel/RecipeBonusLevelForm";
import AreaControlGroup from "./AreaControlGroup";
import EventSelectControl from "./EventSelectControl";
import LevelEvolvedControlGroup from "./LevelEvolvedControlGroup";
import PeriodSelect from "./PeriodSelect";
import TapFrequencyControlGroup from "./TapFrequencyControlGroup";

const StyledSettingForm = styled("div")({
	padding: "0 1rem",
	marginBottom: "10rem",
	"& section": {
		margin: "0.2rem 0",
		fontSize: ".9rem",
		display: "flex",
		flex: "0 auto",
		"&.mt": {
			marginTop: "1rem",
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
	"& > button": {
		marginLeft: "-.4rem",
	},
});

const StrengthSettingForm = React.memo(
	({
		dispatch,
		value,
		items,
		hasHelpingBonus,
	}: {
		dispatch: React.Dispatch<IvAction>;
		value: StrengthParameter;
		items: PokemonBoxItem[];
		hasHelpingBonus: boolean;
	}) => {
		const { t } = useTranslation();
		const [helpOpen, setHelpOpen] = React.useState(false);
		const [helpMessage, setHelpMessage] = React.useState<React.ReactNode>(null);
		const [initializeConfirmOpen, setInitializeConfirmOpen] =
			React.useState(false);

		const addHelpingBonusEffectInfoClick = React.useCallback(() => {
			setHelpMessage(
				<>
					<p>{t("helping bonus addition desc")}</p>
					<p>{t("other member calculation")}</p>
				</>,
			);
			setHelpOpen(true);
		}, [t]);
		const onPityProcHelpClose = React.useCallback(() => {
			setHelpOpen(false);
		}, []);

		const onChange = React.useCallback(
			(value: StrengthParameter) => {
				dispatch({ type: "changeParameter", payload: { parameter: value } });
			},
			[dispatch],
		);

		const onHelpBonusCountChange = React.useCallback(
			(e: SelectChangeEvent) => {
				onChange({
					...value,
					helpBonusCount: parseInt(e.target.value, 10) as 0 | 1 | 2 | 3 | 4,
				});
			},
			[onChange, value],
		);
		const onAddHelpingBonusEffectChange = React.useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				onChange({ ...value, addHelpingBonusEffect: e.target.checked });
			},
			[onChange, value],
		);
		const onEditEnergyClick = React.useCallback(() => {
			dispatch({ type: "openEnergyDialog" });
		}, [dispatch]);
		const onInitializeClick = React.useCallback(() => {
			setInitializeConfirmOpen(true);
		}, []);
		const onInitializeConfirmClose = React.useCallback(() => {
			setInitializeConfirmOpen(false);
		}, []);

		const isNotWhistle = value.period !== whistlePeriod;
		return (
			<StyledSettingForm>
				<section>
					<span className="lbl">{t("period")}:</span>
					<PeriodSelect dispatch={dispatch} value={value} />
				</section>
				<AreaControlGroup value={value} onChange={onChange} />
				<section className="mt">
					<span className="lbl">{t("event")}:</span>
					<EventSelectControl value={value} onChange={onChange} />
				</section>
				<LevelEvolvedControlGroup
					dispatch={dispatch}
					value={value}
					onChange={onChange}
				/>
				<section className="mt">
					<span className="lbl">{t("helping bonus")}:</span>
					<Select
						variant="standard"
						value={value.helpBonusCount.toString()}
						onChange={onHelpBonusCountChange}
					>
						<MenuItem value={0}>{hasHelpingBonus ? "×1" : t("none")}</MenuItem>
						<MenuItem value={1}>{hasHelpingBonus ? "×2" : "×1"}</MenuItem>
						<MenuItem value={2}>{hasHelpingBonus ? "×3" : "×2"}</MenuItem>
						<MenuItem value={3}>{hasHelpingBonus ? "×4" : "×3"}</MenuItem>
						<MenuItem value={4}>{hasHelpingBonus ? "×5" : "×4"}</MenuItem>
					</Select>
				</section>
				<section>
					<span className="lbl">
						{t("helping bonus addition label")}:
						<InfoButton onClick={addHelpingBonusEffectInfoClick} />
					</span>
					<Switch
						checked={value.addHelpingBonusEffect}
						onChange={onAddHelpingBonusEffectChange}
					/>
				</section>
				<OtherTeamMemberForm
					parameter={value}
					dispatch={dispatch}
					items={items}
				/>
				<Collapse in={isNotWhistle}>
					<TapFrequencyControlGroup
						value={value}
						onChange={onChange}
						mt="1rem"
					/>
					<section className="mt">
						<span className="lbl">{t("energy")}:</span>
						<Button onClick={onEditEnergyClick}>{t("edit")}</Button>
					</section>
				</Collapse>
				<RecipeBonusLevelForm value={value} onChange={onChange} />
				<section className="mt">
					<Button onClick={onInitializeClick} variant="outlined">
						{t("initialize all parameters")}
					</Button>
				</section>
				<InitializeConfirmDialog
					open={initializeConfirmOpen}
					onClose={onInitializeConfirmClose}
					dispatch={dispatch}
				/>
				<MessageDialog
					open={helpOpen}
					onClose={onPityProcHelpClose}
					message={helpMessage}
				/>
			</StyledSettingForm>
		);
	},
);

const InitializeConfirmDialog = React.memo(
	({
		dispatch,
		open,
		onClose,
	}: {
		dispatch: React.Dispatch<IvAction>;
		open: boolean;
		onClose: () => void;
	}) => {
		const [snackBarVisible, setSnackBarVisible] = React.useState(false);
		const { t } = useTranslation();

		const onInitialize = React.useCallback(() => {
			dispatch({
				type: "changeParameter",
				payload: {
					parameter: createStrengthParameter({}),
				},
			});
			setSnackBarVisible(true);
			onClose();
		}, [dispatch, onClose]);
		const onSnackbarClose = React.useCallback(() => {
			setSnackBarVisible(false);
		}, []);

		return (
			<>
				<Dialog open={open} onClose={onClose}>
					<DialogTitle>{t("initialize all parameters")}</DialogTitle>
					<DialogContent>
						<p style={{ fontSize: "0.9rem", margin: 0 }}>
							{t("initialize all parameters message")}
						</p>
					</DialogContent>
					<DialogActions>
						<Button onClick={onInitialize} color="error">
							{t("reset")}
						</Button>
						<Button onClick={onClose}>{t("cancel")}</Button>
					</DialogActions>
				</Dialog>
				<Snackbar
					open={snackBarVisible}
					autoHideDuration={2000}
					onClose={onSnackbarClose}
					message={t("initialized all parameters")}
				/>
			</>
		);
	},
);

export default StrengthSettingForm;
