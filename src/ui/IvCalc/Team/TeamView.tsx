import React from "react";
import { simulateTeam } from "../../../util/Team";
import type IvState from "../IvState";
import type { IvAction } from "../IvState";
import DailyView from "./DailyView";
import MemberList from "./MemberList";
import TeamParameterPanel from "./TeamParameterPanel";

const TeamView = React.memo(
	({
		state,
		dispatch,
	}: {
		state: IvState;
		dispatch: (action: IvAction) => void;
	}) => {
		const activeMembers = React.useMemo(
			() => state.teamMembers.map((m) => (m?.enabled ? m.item : undefined)),
			[state.teamMembers],
		);
		const results = simulateTeam(activeMembers, state.parameter);

		return (
			<>
				<DailyView results={results.members} />
				<TeamParameterPanel state={state} dispatch={dispatch} />
				<MemberList state={state} dispatch={dispatch} />
			</>
		);
	},
);

export default TeamView;
