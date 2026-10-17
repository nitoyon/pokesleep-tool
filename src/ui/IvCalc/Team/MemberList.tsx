import { ButtonBase } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import type { PokemonBoxItem } from "../../../util/Box/PokemonBox";
import CarouselContainer from "../../common/CarouselContainer";
import { useElementWidth } from "../../common/Hook";
import type IvState from "../IvState";
import type { IvAction, Team } from "../IvState";
import { TEAM_MEMBER_COUNT } from "../IvState";
import EditMemberDialog from "./EditMemberDialog";
import type { MemberAction, MemberEvent } from "./MemberEvent";
import MemberItem from "./MemberItem";

/**
 * Drag is allowed on PokemonIcon (`svg[width]`), so only sliders are ignored.
 */
const ignoreDragSelector = "span.MuiSlider-root";

const MemberList = React.memo(
	({
		state,
		dispatch,
	}: {
		state: IvState;
		dispatch: (action: IvAction) => void;
	}) => {
		const [width, widthRef] = useElementWidth();
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

		const onTeamIndexChange = React.useCallback(
			(value: number) => {
				dispatch({ type: "setTeamIndex", payload: { teamIndex: value } });
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
					payload: { teamIndex, index: editingIndex, item },
				});
			},
			[teamIndex, editingIndex, dispatch],
		);

		return (
			<StyledMemberList ref={widthRef}>
				<CarouselContainer
					index={teamIndex}
					width={width}
					onChange={onTeamIndexChange}
					ignoreDragSelector={ignoreDragSelector}
				>
					{state.teams.map((team, i) => (
						<TeamMemberGrid
							// biome-ignore lint/suspicious/noArrayIndexKey: teams never reordered
							key={i}
							team={team}
							onChange={onChange}
						/>
					))}
				</CarouselContainer>
				<TeamIndicator
					count={state.teams.length}
					index={teamIndex}
					onChange={onTeamIndexChange}
				/>
				{/* Placed outside the carousel so that drag events in the dialog
				    don't bubble (through the React tree) to the carousel */}
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
			</StyledMemberList>
		);
	},
);

const StyledMemberList = styled("div")({
	margin: "0.6rem 0 0.5rem",
});

/**
 * Grid of member slots in a single team.
 */
const TeamMemberGrid = React.memo(
	({
		team,
		onChange,
	}: {
		team: Team;
		onChange: (event: MemberEvent) => void;
	}) => {
		return (
			<StyledTeamView>
				{Array.from({ length: TEAM_MEMBER_COUNT }, (_, i) => (
					<MemberItem
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed slots
						key={i}
						index={i}
						item={team.members[i]?.item}
						enabled={team.members[i]?.enabled ?? true}
						sneakySnacking={team.members[i]?.sneakySnacking ?? false}
						onChange={onChange}
					/>
				))}
			</StyledTeamView>
		);
	},
);

const StyledTeamView = styled("div")({
	display: "grid",
	gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
	gridGap: ".4rem",
	// Padding instead of margin so that the more button sticking out of
	// the item is not clipped by the carousel (overflow: hidden)
	padding: "4px 0.5rem 0",
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

/**
 * Dots that show the current team and allow jumping to another team.
 */
const TeamIndicator = React.memo(
	({
		count,
		index,
		onChange,
	}: {
		count: number;
		index: number;
		onChange: (value: number) => void;
	}) => {
		return (
			<StyledTeamIndicator>
				{Array.from({ length: count }, (_, i) => (
					<ButtonBase
						// biome-ignore lint/suspicious/noArrayIndexKey: fixed dots
						key={i}
						className={i === index ? "active" : undefined}
						onClick={() => onChange(i)}
						aria-label={`${i + 1}`}
					/>
				))}
			</StyledTeamIndicator>
		);
	},
);

const StyledTeamIndicator = styled("div")({
	display: "flex",
	justifyContent: "center",
	gap: "0.5rem",
	marginTop: "0.5rem",
	"& > button": {
		width: "8px",
		height: "8px",
		borderRadius: "50%",
		background: "#cccccc",
		"&.active": {
			background: "#7fdd7f",
		},
	},
});

export default MemberList;
