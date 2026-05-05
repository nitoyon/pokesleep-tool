import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import MoreIcon from "@mui/icons-material/MoreVert";
import OutboxIcon from "@mui/icons-material/Outbox";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import {
	IconButton,
	ListItemIcon,
	Menu,
	MenuItem,
	MenuList,
} from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import type PokemonIv from "../../../util/PokemonIv";
import PokemonIcon from "../PokemonIcon";
import type { MemberAction, MemberEvent } from "./MemberEvent";

const MemberItem = React.memo(
	({
		index,
		iv,
		onChange,
	}: {
		index: number;
		iv?: PokemonIv;
		onChange: (event: MemberEvent) => void;
	}) => {
		if (iv === undefined) {
			return <EmptyMemberItem index={index} onChange={onChange} />;
		}

		return <ValidMemberBox index={index} iv={iv} onChange={onChange} />;
	},
);

const EmptyMemberItem = React.memo(
	({
		index,
		onChange,
	}: {
		index: number;
		onChange: (event: MemberEvent) => void;
	}) => {
		const onBoxClickHandler = React.useCallback(() => {
			onChange({ index, action: "add" });
		}, [index, onChange]);

		return (
			<StyledMember>
				<IconButton onClick={onBoxClickHandler}>
					<OutboxIcon />
				</IconButton>
			</StyledMember>
		);
	},
);

const ValidMemberBox = React.memo(
	({
		index,
		iv,
		onChange,
	}: {
		index: number;
		iv: PokemonIv;
		onChange: (event: MemberEvent) => void;
	}) => {
		const { t } = useTranslation();
		const [moreMenuAnchor, setMoreMenuAnchor] =
			React.useState<HTMLElement | null>(null);
		const onAction = React.useCallback(
			(action: MemberAction) => {
				onChange({
					index,
					action,
				});
			},
			[index, onChange],
		);
		const onMenuClick = React.useCallback(
			(event: React.MouseEvent<HTMLElement>) => {
				setMoreMenuAnchor(event.currentTarget);
			},
			[],
		);
		const onMoreMenuClose = React.useCallback(() => {
			setMoreMenuAnchor(null);
		}, []);
		const isMenuOpen = Boolean(moreMenuAnchor);

		return (
			<StyledMember>
				<div className="icon">
					<header>
						<span className="lv">Lv.</span>
						{iv.level}
					</header>
					<PokemonIcon idForm={iv.idForm} shiny={iv.shiny} size={32} />
					<footer>{t(`pokemons.${iv.pokemonName}`)}</footer>
					<IconButton onClick={onMenuClick}>
						<MoreIcon />
					</IconButton>
				</div>
				<Menu
					anchorEl={moreMenuAnchor}
					open={isMenuOpen}
					onClose={onMoreMenuClose}
					anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				>
					<MenuList>
						<MenuItem onClick={() => onAction("edit")}>
							<ListItemIcon>
								<EditNoteOutlinedIcon />
							</ListItemIcon>
							{t("edit")}
						</MenuItem>
						<MenuItem onClick={() => onAction("clear")}>
							<ListItemIcon sx={{ minWidth: "24px" }}>
								<RemoveCircleOutlineOutlinedIcon />
							</ListItemIcon>
							{t("delete")}
						</MenuItem>
					</MenuList>
				</Menu>
			</StyledMember>
		);
	},
);

const StyledMember = styled("div")({
	border: "1px solid #aaa",
	borderRadius: "10px",
	"& > div.icon": {
		position: "relative",
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
		"& > button.MuiIconButton-root": {
			position: "absolute",
			right: "-8px",
			top: "-4px",
			"& > svg": {
				width: "0.8rem",
				height: "0.8rem",
			},
		},
	},
});

export default MemberItem;
