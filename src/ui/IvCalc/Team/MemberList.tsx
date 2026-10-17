import { ButtonBase } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import type { PokemonBoxItem } from "../../../util/Box/PokemonBox";
import { mod } from "../../../util/NumberUtil";
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

		const teamCount = state.teams.length;
		const onPrevClick = React.useCallback(() => {
			onTeamIndexChange(mod(teamIndex - 1, teamCount));
		}, [onTeamIndexChange, teamIndex, teamCount]);
		const onNextClick = React.useCallback(() => {
			onTeamIndexChange(mod(teamIndex + 1, teamCount));
		}, [onTeamIndexChange, teamIndex, teamCount]);

		return (
			<StyledMemberList ref={widthRef}>
				<div className="carousel">
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
					<ButtonBase
						className="prev"
						onClick={onPrevClick}
						aria-label="previous team"
					>
						<ArrowIcon direction="left" />
					</ButtonBase>
					<ButtonBase
						className="next"
						onClick={onNextClick}
						aria-label="next team"
					>
						<ArrowIcon direction="right" />
					</ButtonBase>
				</div>
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
	"& > .carousel": {
		position: "relative",
		"& > button.prev, & > button.next": {
			position: "absolute",
			top: "50%",
			transform: "translateY(-50%)",
			width: "16px",
			height: "40px",
			borderRadius: "12px",
			"& > svg": {
				width: "12px",
				height: "24px",
				filter: "drop-shadow(0 3px 0 rgba(0, 0, 0, 0.15))",
			},
		},
		"& > button.prev": {
			left: 0,
		},
		"& > button.next": {
			right: 0,
		},
	},
});

/**
 * White chevron with a brown outline used for the prev/next buttons.
 */
const ArrowIcon = ({ direction }: { direction: "left" | "right" }) => {
	const points = direction === "left" ? "11,4 4,14 11,24" : "5,4 12,14 5,24";
	return (
		<svg
			viewBox="0 0 16 28"
			fill="none"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<polyline points={points} stroke="#c5a686" strokeWidth={8} />
			<polyline points={points} stroke="#ffffff" strokeWidth={4} />
		</svg>
	);
};

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
	gap: "0.8rem",
	marginTop: "0.8rem",
	"& > button": {
		width: "10px",
		height: "10px",
		borderRadius: "50%",
		background: "#cccccc",
		"&.active": {
			background: "#7fdd7f",
		},
	},
});

export default MemberList;
