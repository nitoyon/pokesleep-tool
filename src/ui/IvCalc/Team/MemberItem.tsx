import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckIcon from "@mui/icons-material/Check";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import MoreIcon from "@mui/icons-material/MoreVert";
import OutboxIcon from "@mui/icons-material/Outbox";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import {
	ButtonBase,
	Divider,
	Icon,
	IconButton,
	ListItemIcon,
	Menu,
	MenuItem,
	MenuList,
} from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import type { PokemonBoxItem } from "../../../util/PokemonBox";
import { useLongPress } from "../../common/Hook";
import PokemonIcon from "../PokemonIcon";
import type { MemberAction, MemberEvent } from "./MemberEvent";

const MemberItem = React.memo(
	({
		index,
		item,
		enabled = true,
		onChange,
	}: {
		index: number;
		item?: PokemonBoxItem;
		enabled?: boolean;
		onChange: (event: MemberEvent) => void;
	}) => {
		if (item === undefined) {
			return <EmptyMemberItem index={index} onChange={onChange} />;
		}

		return (
			<ValidMemberBox
				index={index}
				item={item}
				enabled={enabled}
				onChange={onChange}
			/>
		);
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
			<StyledEmptyMember>
				<ButtonBase onClick={onBoxClickHandler}>
					<AddCircleOutlineIcon />
				</ButtonBase>
			</StyledEmptyMember>
		);
	},
);

const StyledEmptyMember = styled("div")({
	border: "1px solid #aaa",
	borderRadius: "10px",
	"& > button": {
		borderRadius: "10px",
		width: "100%",
		height: "100%",
		minHeight: "70px",
		"& > svg": {
			color: "#999",
		},
	},
});

const ValidMemberBox = React.memo(
	({
		index,
		item,
		enabled,
		onChange,
	}: {
		index: number;
		item: PokemonBoxItem;
		enabled: boolean;
		onChange: (event: MemberEvent) => void;
	}) => {
		const { t } = useTranslation();
		const iv = item.iv;
		const [moreMenuAnchor, setMoreMenuAnchor] =
			React.useState<HTMLElement | null>(null);

		const onAction = React.useCallback(
			(action: MemberAction) => {
				setMoreMenuAnchor(null);
				onChange({
					index,
					action,
				});
			},
			[index, onChange],
		);

		const onPokemonClick = React.useCallback(() => {
			onChange({ index, action: "openbox" });
		}, [index, onChange]);
		const onLongPress = React.useCallback(() => {
			onChange({ index, action: "editiv" });
		}, [index, onChange]);
		const longPressRef = useLongPress(onLongPress, 500);

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
			<StyledMember className={enabled ? undefined : "disabled"}>
				<ButtonBase onClick={onPokemonClick} ref={longPressRef}>
					<header>
						<span className="lv">Lv.</span>
						{iv.level}
					</header>
					<PokemonIcon idForm={iv.idForm} shiny={iv.shiny} size={32} />
					<footer>{item.filledNickname(t)}</footer>
				</ButtonBase>
				<IconButton onClick={onMenuClick}>
					<MoreIcon />
				</IconButton>
				<Menu
					anchorEl={moreMenuAnchor}
					open={isMenuOpen}
					onClose={onMoreMenuClose}
					anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				>
					<MenuList>
						<MenuItem onClick={() => onAction("openbox")}>
							<ListItemIcon>
								<OutboxIcon />
							</ListItemIcon>
							{t("box")}
						</MenuItem>
						<MenuItem onClick={() => onAction("editiv")}>
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
						<Divider />
						<MenuItem onClick={() => onAction("toggleEnabled")}>
							<ListItemIcon>{enabled ? <Icon /> : <CheckIcon />}</ListItemIcon>
							{t("disable")}
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
	position: "relative",
	"&.disabled > button:first-of-type": {
		filter: "grayscale(0.8)",
		opacity: 0.4,
	},
	"& > button:first-of-type": {
		background: "#f9f9ee",
		borderRadius: "10px",
		fontFamily: `"M PLUS 1p"`,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "flex-start",
		width: "100%",
		height: "100%",
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
	"& > button.MuiIconButton-root": {
		position: "absolute",
		right: "-8px",
		top: "-4px",
		"& > svg": {
			width: "0.8rem",
			height: "0.8rem",
		},
	},
});

export default MemberItem;
