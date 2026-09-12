import { styled } from "@mui/system";
import React from "react";
import type { PokemonBoxItem } from "../../../util/PokemonBox";
import type IvState from "../IvState";
import type { IvAction } from "../IvState";
import EditMemberDialog from "./EditMemberDialog";
import type { MemberAction, MemberEvent } from "./MemberEvent";
import MemberItem from "./MemberItem";

const MemberList = React.memo(
	({
		state,
		dispatch,
	}: {
		state: IvState;
		dispatch: (action: IvAction) => void;
	}) => {
		const [boxDialogOpen, setBoxDialogOpen] = React.useState(false);
		const [editingIndex, setEditingIndex] = React.useState(-1);
		const [editAction, setEditAction] = React.useState<MemberAction>("add");

		const onChange = React.useCallback(
			(event: MemberEvent) => {
				if (
					event.action === "add" ||
					event.action === "editiv" ||
					event.action === "openbox"
				) {
					setEditAction(event.action);
					setEditingIndex(event.index);
					setBoxDialogOpen(true);
					return;
				}

				if (event.action === "clear") {
					dispatch({
						type: "setTeamMember",
						payload: { index: event.index, item: undefined },
					});
					return;
				}

				if (event.action === "toggleEnabled") {
					const cur = state.teamMembers[event.index];
					if (cur !== undefined) {
						dispatch({
							type: "setTeamMemberEnabled",
							payload: { index: event.index, enabled: !cur.enabled },
						});
					}
					return;
				}
			},
			[dispatch, state.teamMembers],
		);

		const onBoxDialogClose = React.useCallback(() => {
			setBoxDialogOpen(false);
		}, []);

		const onBoxSelect = React.useCallback(
			(item: PokemonBoxItem) => {
				dispatch({
					type: "setTeamMember",
					payload: { index: editingIndex, item },
				});
			},
			[editingIndex, dispatch],
		);

		return (
			<StyledTeamView>
				{[0, 1, 2, 3, 4].map((i) => (
					<MemberItem
						key={i}
						index={i}
						item={state.teamMembers[i]?.item}
						enabled={state.teamMembers[i]?.enabled ?? true}
						onChange={onChange}
					/>
				))}
				<EditMemberDialog
					action={editAction}
					open={boxDialogOpen}
					items={state.box.items}
					item={state.teamMembers[editingIndex]?.item}
					parameter={state.parameter}
					dispatch={dispatch}
					onClose={onBoxDialogClose}
					onSelect={onBoxSelect}
				/>
			</StyledTeamView>
		);
	},
);

const StyledTeamView = styled("div")({
	display: "grid",
	gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
	gridGap: ".4rem",
	margin: "0.6rem 0.5rem 0",
	"& > article": {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "column",
		"& > div": {
			display: "flex",
			flexDirection: "row",
		},
	},
});

export default MemberList;
