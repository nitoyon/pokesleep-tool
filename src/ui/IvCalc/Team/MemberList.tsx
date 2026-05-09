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
						payload: { index: event.index, iv: undefined },
					});
					return;
				}
			},
			[dispatch],
		);

		const onBoxDialogClose = React.useCallback(() => {
			setBoxDialogOpen(false);
		}, []);

		const onBoxSelect = React.useCallback(
			(item: PokemonBoxItem) => {
				dispatch({
					type: "setTeamMember",
					payload: { index: editingIndex, iv: item.iv },
				});
			},
			[editingIndex, dispatch],
		);

		return (
			<StyledTeamView>
				<MemberItem index={0} iv={state.teamMembers[0]} onChange={onChange} />
				<MemberItem index={1} iv={state.teamMembers[1]} onChange={onChange} />
				<MemberItem index={2} iv={state.teamMembers[2]} onChange={onChange} />
				<MemberItem index={3} iv={state.teamMembers[3]} onChange={onChange} />
				<MemberItem index={4} iv={state.teamMembers[4]} onChange={onChange} />
				<EditMemberDialog
					action={editAction}
					open={boxDialogOpen}
					items={state.box.items}
					iv={state.teamMembers[editingIndex]}
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
	margin: "0 0.5rem",
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
