import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import IosShareIcon from "@mui/icons-material/IosShare";
import MoreIcon from "@mui/icons-material/MoreVert";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import {
	ButtonBase,
	IconButton,
	ListItemIcon,
	Menu,
	MenuItem,
	MenuList,
} from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { favoriteMaskToColors } from "../../../util/Box/FavoriteColor";
import type { PokemonBoxItem } from "../../../util/Box/PokemonBox";
import { useLongPress } from "../../common/Hook";
import CandyIcon from "../../Resources/CandyIcon";
import type { IvAction } from "../IvState";
import PokemonIcon from "../PokemonIcon";
import { shareIv } from "../ShareUtil";
import FavoriteStar from "./FavoriteStar";

/** Max number of favorite stars shown in the box list. */
const maxListFavoriteCount = 4;

interface BoxLargeItemProps {
	item: PokemonBoxItem;
	selected: boolean;
	dispatch: (action: IvAction) => void;
	onCandyClick: (item: PokemonBoxItem) => void;
	onSelect: (id: number) => void;
	onEdit?: (id: number) => void;
	selectedRef?: React.RefObject<HTMLDivElement | null>;
}

const BoxLargeItem = React.memo(
	({
		item,
		selected,
		dispatch,
		onCandyClick,
		onSelect,
		onEdit,
		selectedRef,
	}: BoxLargeItemProps) => {
		const { t } = useTranslation();
		const [moreMenuAnchor, setMoreMenuAnchor] =
			React.useState<HTMLElement | null>(null);
		const isMenuOpen = Boolean(moreMenuAnchor);

		const longPressRef = useLongPress(() => {
			onSelect(item.id);
			onEdit?.(item.id);
		}, 500);

		const clickHandler = React.useCallback(() => {
			onSelect(item.id);
		}, [onSelect, item.id]);
		const onMoreIconClick = React.useCallback(
			(event: React.MouseEvent<HTMLElement>) => {
				setMoreMenuAnchor(event.currentTarget);
			},
			[],
		);
		const onMoreMenuClose = React.useCallback(() => {
			setMoreMenuAnchor(null);
		}, []);
		const onMenuClick = React.useCallback(
			(type: "dup" | "remove") => {
				dispatch({ type, payload: { id: item.id } } as IvAction);
				setMoreMenuAnchor(null);
			},
			[item, dispatch],
		);
		const onShareClick = React.useCallback(() => {
			setMoreMenuAnchor(null);
			shareIv(item.iv, dispatch, t);
		}, [dispatch, item.iv, t]);
		const onCandyClickHandler = React.useCallback(() => {
			setMoreMenuAnchor(null);
			onCandyClick(item);
		}, [item, onCandyClick]);
		const onEditClickHandler = React.useCallback(() => {
			setMoreMenuAnchor(null);
			onEdit?.(item.id);
		}, [item.id, onEdit]);

		const favorites = favoriteMaskToColors(item.favorites);

		return (
			<StyledBoxLargeItem ref={selected ? selectedRef : null}>
				<ButtonBase
					onClick={clickHandler}
					className={selected ? "selected" : ""}
					ref={longPressRef}
				>
					<header>
						<span className="lv">Lv.</span>
						{item.iv.level}
					</header>
					<PokemonIcon
						idForm={item.iv.idForm}
						shiny={item.iv.shiny}
						size={32}
					/>
					<footer>{item.filledNickname(t)}</footer>
				</ButtonBase>
				{favorites.length > 0 && (
					<span className="favorite">
						{favorites.slice(0, maxListFavoriteCount).map((c) => (
							<FavoriteStar key={c} color={c} filled size={10} />
						))}
					</span>
				)}
				{selected && (
					<IconButton onClick={onMoreIconClick}>
						<MoreIcon />
					</IconButton>
				)}
				<Menu
					anchorEl={moreMenuAnchor}
					open={isMenuOpen}
					onClose={onMoreMenuClose}
					anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				>
					<MenuList>
						<MenuItem onClick={onEditClickHandler}>
							<ListItemIcon>
								<EditNoteOutlinedIcon />
							</ListItemIcon>
							{t("edit")}
						</MenuItem>
						<MenuItem onClick={onCandyClickHandler}>
							<ListItemIcon sx={{ minWidth: "24px" }}>
								<CandyIcon sx={{ color: "#888" }} />
							</ListItemIcon>
							{t("candy")}
						</MenuItem>
						<MenuItem onClick={onShareClick}>
							<ListItemIcon>
								<IosShareIcon />
							</ListItemIcon>
							{t("share")}
						</MenuItem>
						<MenuItem onClick={() => onMenuClick("dup")}>
							<ListItemIcon>
								<ContentCopyOutlinedIcon />
							</ListItemIcon>
							{t("duplicate")}
						</MenuItem>
						<MenuItem onClick={() => onMenuClick("remove")}>
							<ListItemIcon sx={{ minWidth: "24px" }}>
								<RemoveCircleOutlineOutlinedIcon />
							</ListItemIcon>
							{t("delete")}
						</MenuItem>
					</MenuList>
				</Menu>
			</StyledBoxLargeItem>
		);
	},
);

const StyledBoxLargeItem = styled("div")({
	position: "relative",
	"& > button:first-of-type": {
		fontFamily: `"M PLUS 1p"`,
		display: "block",
		textAlign: "center",
		width: "80px",
		padding: "0.2rem 0",
		border: "1px solid transparent",
		"& > header": {
			fontSize: "0.7rem",
			fontFamily: "Montserrat, sans-serif",
			fontWeight: 600,
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
			fontSize: "0.8rem",
			color: "#666666",
			overflowWrap: "anywhere",
		},
		"&.selected": {
			background: "rgb(211, 233, 247, 0.8)",
			borderRadius: "0.5rem",
			border: "1px solid #5e7da0",
		},
	},
	"& > span.favorite": {
		position: "absolute",
		right: "4px",
		top: "18px",
		display: "flex",
		flexDirection: "column",
		pointerEvents: "none",
	},
	"& > button.MuiIconButton-root": {
		position: "absolute",
		right: "-5px",
		top: "-2px",
		"& > svg": {
			width: "0.8rem",
			height: "0.8rem",
		},
	},
});

export default BoxLargeItem;
