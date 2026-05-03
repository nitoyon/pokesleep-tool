import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import OutboxIcon from "@mui/icons-material/Outbox";
import { IconButton } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import type { PokemonBoxItem } from "../../../util/PokemonBox";
import type PokemonIv from "../../../util/PokemonIv";
import BoxSelectDialog from "../Box/BoxSelectDialog";
import type IvState from "../IvState";
import type { IvAction } from "../IvState";
import PokemonIcon from "../PokemonIcon";
import SpecialtyButton from "../SpecialtyButton";

const TeamView = React.memo(
	({
		state,
		dispatch,
	}: {
		state: IvState;
		dispatch: (action: IvAction) => void;
	}) => {
		const [boxDialogOpen, setBoxDialogOpen] = React.useState(false);
		const [editingIndex, setEditingIndex] = React.useState(-1);

		const onBoxClick = React.useCallback((index: number) => {
			setEditingIndex(index);
			setBoxDialogOpen(true);
		}, []);

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
				<span />
				<SpecialtyButton specialty="Berries" disabled sx={{ width: "100%" }} />
				<SpecialtyButton
					specialty="Ingredients"
					disabled
					sx={{ width: "100%" }}
				/>
				<SpecialtyButton specialty="Skills" disabled sx={{ width: "100%" }} />
				<MemberView
					index={0}
					iv={state.teamMembers[0]}
					onBoxClick={onBoxClick}
				/>
				<MemberView
					index={1}
					iv={state.teamMembers[1]}
					onBoxClick={onBoxClick}
				/>
				<MemberView
					index={2}
					iv={state.teamMembers[2]}
					onBoxClick={onBoxClick}
				/>
				<MemberView
					index={3}
					iv={state.teamMembers[3]}
					onBoxClick={onBoxClick}
				/>
				<MemberView
					index={4}
					iv={state.teamMembers[4]}
					onBoxClick={onBoxClick}
				/>
				<BoxSelectDialog
					open={boxDialogOpen}
					items={state.box.items}
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
	gridTemplateColumns: "80px 1fr 1fr 1fr",
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

const MemberView = React.memo(
	({
		index,
		iv,
		onBoxClick,
	}: {
		index: number;
		iv?: PokemonIv;
		onBoxClick: (index: number) => void;
	}) => {
		if (iv === undefined) {
			return (
				<>
					<EmptyMemberBox index={index} onBoxClick={onBoxClick} />
					<span />
					<span />
					<span />
				</>
			);
		}

		return (
			<>
				<ValidMemberBox iv={iv} />
				<article>
					<div>
						<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
						12,345
					</div>
				</article>
				<span />
				<span />
			</>
		);
	},
);

const EmptyMemberBox = React.memo(
	({
		index,
		onBoxClick,
	}: {
		index: number;
		onBoxClick: (index: number) => void;
	}) => {
		const onBoxClickHandler = React.useCallback(() => {
			onBoxClick(index);
		}, [index, onBoxClick]);

		return (
			<StyledEmptyMember>
				<IconButton onClick={onBoxClickHandler}>
					<OutboxIcon />
				</IconButton>
			</StyledEmptyMember>
		);
	},
);

const ValidMemberBox = React.memo(({ iv }: { iv: PokemonIv }) => {
	const { t } = useTranslation();

	return (
		<StyledEmptyMember>
			<div className="icon">
				<header>
					<span className="lv">Lv.</span>
					{iv.level}
				</header>
				<PokemonIcon idForm={iv.idForm} size={32} />
				<footer>{t(`pokemons.${iv.pokemonName}`)}</footer>
			</div>
		</StyledEmptyMember>
	);
});

const StyledEmptyMember = styled("div")({
	border: "1px solid #aaa",
	borderRadius: "10px",
	"& > div.icon": {
		textAlign: "center",
		"& > header": {
			fontSize: "0.7rem",
			fontWeight: "bold",
			"& > span.lv": {
				color: "#62d540",
				fontSize: "0.6rem",
				paddingRight: "0.2rem",
			},
		},
		"& > div": {
			margin: "0.1rem auto 0.1rem",
		},
		"& > footer": {
			fontSize: "0.7rem",
			color: "#666666",
			overflowWrap: "anywhere",
		},
	},
});

export default TeamView;
