import React from "react";
import PokemonStrength from "../../../util/PokemonStrength";
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
		const results = state.teamMembers.map((member) =>
			member
				? new PokemonStrength(member.iv, state.parameter).calculate()
				: undefined,
		);

		return (
			<>
				<MemberList state={state} dispatch={dispatch} />
				<DailyView results={results} />
			</>
		);
	},
);

export default TeamView;
