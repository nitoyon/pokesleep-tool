import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Switch,
	ToggleButton,
	ToggleButtonGroup,
} from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { round1 } from "../../../util/NumberUtil";
import type PokemonStrength from "../../../util/PokemonStrength";
import type { StrengthResult } from "../../../util/PokemonStrength";
import type { IvAction } from "../IvState";
import EnergyPreviewPanel from "../Panel/EnergyPreviewPanel";

const SkillPityProcDialog = React.memo(
	({
		open,
		dispatch,
		onClose,
		strength,
		result,
	}: {
		open: boolean;
		dispatch: React.Dispatch<IvAction>;
		onClose: () => void;
		strength: PokemonStrength;
		result: StrengthResult;
	}) => {
		const { t } = useTranslation();
		const onHelpingBonusChange = React.useCallback(
			(_: React.MouseEvent, value: string | null) => {
				if (value !== null) {
					dispatch({
						type: "changeParameter",
						payload: {
							parameter: {
								...strength.parameter,
								helpBonusCount: parseInt(value, 10) as 0 | 1 | 2 | 3 | 4,
							},
						},
					});
				}
			},
			[dispatch, strength.parameter],
		);
		const onCampTicketChange = React.useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				dispatch({
					type: "changeParameter",
					payload: {
						parameter: {
							...strength.parameter,
							isGoodCampTicketSet: e.target.checked,
						},
					},
				});
			},
			[dispatch, strength.parameter],
		);

		if (!open) {
			return null;
		}

		const iv = strength.pokemonIv;
		const overallSkillRate = iv.calculateSkillRateWithPityProc(
			result.skillRate,
		);
		const param = strength.parameter;
		const hasHelpingBonus = iv.hasHelpingBonusInActiveSubSkills;
		const pityProcRate = (1 - result.skillRate) ** iv.pityProcHelpCount;

		return (
			<StyledDialog open={open} onClose={onClose}>
				<DialogTitle>{t("pity proc")}</DialogTitle>
				<DialogContent>
					<header>
						<p>{t("pity proc help")}</p>
						<p>
							<Trans
								i18nKey="pity proc help3"
								components={{
									name: <b>{t(`pokemons.${iv.pokemon.name}`)}</b>,
									count: <b>{iv.pityProcHelpCount}</b>,
									count1: <b>{iv.pityProcHelpCount + 1}</b>,
								}}
							/>
						</p>
					</header>
					<section>
						<span className="lbl">{t("pity proc rate")}:</span>
						<span>{round1(pityProcRate * 100)}%</span>
					</section>
					<section>
						<span className="lbl">{t("skill rate")}:</span>
					</section>
					<section className="indent">
						<span className="lbl">{t("with pity proc")}:</span>
						<span>{round1(overallSkillRate * 100)}%</span>
					</section>
					<section className="indent">
						<span className="lbl">{t("without pity proc")}:</span>
						<span>{round1(result.skillRate * 100)}%</span>
					</section>
					<section className="mt">
						<span className="lbl">{t("time to pity proc")}:</span>
					</section>
					<EnergyPreviewPanel
						baseFreq={result.baseFreq}
						pityProc={iv.pityProcHelpCount}
						display="pity"
					/>
					<section>
						<span className="lbl">{t("helping bonus")}:</span>
						<ToggleButtonGroup
							size="small"
							exclusive
							value={param.helpBonusCount}
							onChange={onHelpingBonusChange}
						>
							<ToggleButton value={0}>
								{hasHelpingBonus ? "1" : "0"}
							</ToggleButton>
							<ToggleButton value={1}>
								{hasHelpingBonus ? "2" : "1"}
							</ToggleButton>
							<ToggleButton value={2}>
								{hasHelpingBonus ? "3" : "2"}
							</ToggleButton>
							<ToggleButton value={3}>
								{hasHelpingBonus ? "4" : "3"}
							</ToggleButton>
							<ToggleButton value={4}>
								{hasHelpingBonus ? "5" : "4"}
							</ToggleButton>
						</ToggleButtonGroup>
					</section>
					<section>
						<span className="lbl">{t("good camp ticket")}:</span>
						<Switch
							checked={param.isGoodCampTicketSet}
							onChange={onCampTicketChange}
							size="small"
						/>
					</section>
					<footer>
						<Trans
							i18nKey="pity proc ref"
							components={{
								raenonx: <a href={t("pity proc url")}>RaenonX</a>,
							}}
						/>
					</footer>
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
		// extend dialog width
		minWidth: "320px",
		maxWidth: "450px",
		margin: "30px",
		maxHeight: "calc(100% - 90px)",
	},

	"& h2.MuiDialogTitle-root": {
		padding: "0.6rem 0.8rem 0.4rem",
	},

	"& .MuiDialogContent-root": {
		padding: "0 0.8rem 0 0.8rem",
	},

	"& header": {
		fontSize: "0.8rem",
		color: "#888",
		marginBottom: "0.7rem",
		"& > p": {
			margin: 0,
		},
	},

	"& section": {
		margin: "0.2rem 0",
		fontSize: ".9rem",
		display: "flex",
		flex: "0 auto",
		"&.mt": {
			marginTop: "1rem",
		},
		"&.indent": {
			marginLeft: "1rem",
		},
		"& > span.lbl": {
			marginRight: "auto",
			marginTop: 0,
			textWrap: "nowrap",
		},
		"& button.MuiToggleButton-root": {
			margin: 0,
			padding: "0 0.5rem",
		},
	},

	"& footer": {
		fontSize: "0.8rem",
		color: "#888",
		marginTop: "0.7rem",
	},
});

export default SkillPityProcDialog;
