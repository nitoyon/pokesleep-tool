import { styled } from "@mui/system";
import React from "react";
import type { PokemonBoxItem } from "../../../util/Box/PokemonBox";
import type IvState from "../IvState";
import type { IvAction } from "../IvState";
import { TEAM_MEMBER_COUNT } from "../IvState";
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
		const teamIndex = state.teamIndex;
		const members = state.teams[teamIndex]?.members ?? [];

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
						payload: { teamIndex, index: event.index, item: undefined },
					});
					return;
				}

				if (event.action === "toggleEnabled") {
					const cur = members[event.index];
					if (cur !== undefined) {
						dispatch({
							type: "setTeamMemberEnabled",
							payload: {
								teamIndex,
								index: event.index,
								enabled: !cur.enabled,
							},
						});
					}
					return;
				}

				if (event.action === "toggleSneakySnacking") {
					const cur = members[event.index];
					if (cur !== undefined) {
						dispatch({
							type: "setTeamMemberSneakySnacking",
							payload: {
								teamIndex,
								index: event.index,
								sneakySnacking: !cur.sneakySnacking,
							},
						});
					}
					return;
				}
			},
			[dispatch, teamIndex, members],
		);

		const onBoxDialogClose = React.useCallback(() => {
			setBoxDialogOpen(false);
		}, []);

		const onBoxSelect = React.useCallback(
			(item: PokemonBoxItem) => {
				dispatch({
					type: "setTeamMember",
					payload: { teamIndex, index: editingIndex, item },
				});
			},
			[teamIndex, editingIndex, dispatch],
		);

		return (
			<StyledTeamView>
				{Array.from({ length: TEAM_MEMBER_COUNT }, (_, i) => (
					<MemberItem
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed slots
						key={i}
						index={i}
						item={members[i]?.item}
						enabled={members[i]?.enabled ?? true}
						sneakySnacking={members[i]?.sneakySnacking ?? false}
						onChange={onChange}
					/>
				))}
				<EditMemberDialog
					action={editAction}
					open={boxDialogOpen}
					items={state.box.items}
					item={members[editingIndex]?.item}
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
	margin: "0.6rem 0.5rem 25rem",
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
