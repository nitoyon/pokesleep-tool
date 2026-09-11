import { CircularProgress } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
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
