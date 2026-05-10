import React from "react";
import { simulateTeam } from "../../../util/Team";
import type IvState from "../IvState";
import type { IvAction } from "../IvState";
import DailyView from "./DailyView";
import MemberList from "./MemberList";

const TeamView = React.memo(
	({
		state,
		dispatch,
	}: {
		state: IvState;
		dispatch: (action: IvAction) => void;
	}) => {
		const results = simulateTeam(state.teamMembers, state.parameter);

		return (
			<>
				<DailyView results={results.members} />
				<MemberList state={state} dispatch={dispatch} />
			</>
		);
	},
);

export default TeamView;
