import React from "react";
import type IvState from "../IvState";
import type { IvAction } from "../IvState";
import StrengthParameterSummary from "../Strength/StrengthParameterSummary";
import TeamParameterDialog from "./TeamParameterDialog";

const TeamParameterPanel = React.memo(
	({
		state,
		dispatch,
	}: {
		state: IvState;
		dispatch: (action: IvAction) => void;
	}) => {
		const [settingDialogOpen, setSettingDialogOpen] = React.useState(false);

		const onEditClick = React.useCallback(() => {
			setSettingDialogOpen(true);
		}, []);
		const onSettingDialogClose = React.useCallback(() => {
			setSettingDialogOpen(false);
		}, []);

		return (
			<div style={{ margin: "0.5rem 0.5rem 0.2rem" }}>
				<StrengthParameterSummary
					state={state}
					dispatch={dispatch}
					onEditClick={onEditClick}
				/>
				<TeamParameterDialog
					value={state.parameter}
					dispatch={dispatch}
					open={settingDialogOpen}
					onClose={onSettingDialogClose}
				/>
			</div>
		);
	},
);

export default TeamParameterPanel;
