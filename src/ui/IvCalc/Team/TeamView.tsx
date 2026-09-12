import { CircularProgress } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { useElementWidth } from "../../common/Hook";
import { MemberStrengthChart } from "../Chart/MemberStrengthChart";
import type IvState from "../IvState";
import type { IvAction } from "../IvState";
import DailyView from "./DailyView";
import MemberList from "./MemberList";
import TeamParameterPanel from "./TeamParameterPanel";
import { useTeamSimulation } from "./useTeamSimulation";

const TeamView = React.memo(
	({
		state,
		dispatch,
	}: {
		state: IvState;
		dispatch: (action: IvAction) => void;
	}) => {
		const { t } = useTranslation();
		const [chartWidth, chartRef] = useElementWidth();
		const activeMembers = React.useMemo(
			() => state.teamMembers.map((m) => (m?.enabled ? m.item : undefined)),
			[state.teamMembers],
		);
		const { result: results, loading } = useTeamSimulation(
			activeMembers,
			state.parameter,
		);

		return (
			<StyledDiv>
				{loading && <CircularProgress className="loading" size={24} />}
				<DailyView results={results.members} />
				<div className="chart" ref={chartRef}>
					<MemberStrengthChart width={chartWidth} results={results.members} />
				</div>
				{(state.parameter.event.startsWith("pursue mewtwo") ||
					state.teamMembers.some(
						(x) => x?.item?.iv?.pokemonName === "Mewtwo",
					)) && (
					<div
						style={{
							gridColumn: "1 / -1",
							border: "1px solid red",
							background: "#ffeeee",
							color: "red",
							fontSize: "0.8rem",
							borderRadius: "0.5rem",
							margin: ".2rem .5rem 0",
							padding: "0 0.3rem",
						}}
					>
						{t("mewtwo warning")}
					</div>
				)}
				<TeamParameterPanel state={state} dispatch={dispatch} />
				<MemberList state={state} dispatch={dispatch} />
			</StyledDiv>
		);
	},
);

const StyledDiv = styled("div")({
	position: "relative",
	"& > .loading": {
		position: "absolute",
		top: 0,
		right: "0.5rem",
		zIndex: 1,
	},
	"& > .chart": {
		margin: "0 1rem",
		"& > svg": {
			userSelect: "none",
		},
	},
});

export default TeamView;
