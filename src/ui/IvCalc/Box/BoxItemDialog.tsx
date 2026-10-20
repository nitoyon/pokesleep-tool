import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import {
	Button,
	ButtonBase,
	Dialog,
	DialogActions,
	TextField,
	ToggleButton,
} from "@mui/material";
import Slide from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { PokemonBoxItem } from "../../../util/Box/PokemonBox";
import PokemonIv from "../../../util/PokemonIv";
import PokemonRp from "../../../util/PokemonRp";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import IvForm from "../IvForm/IvForm";
import type { IvAction } from "../IvState";
import TypeSpecialtyPanel from "../Panel/TypeSpecialtyPanel";
import PokemonIcon from "../PokemonIcon";
import RpLabel from "../Rp/RpLabel";

// Full-screen transition
// https://mui.com/material-ui/react-dialog/#full-screen-dialogs
const Transition = React.forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement;
	},
	ref: React.Ref<unknown>,
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const BoxItemDialog = React.memo(
	({
		open,
		boxItem,
		isEdit,
		parameter,
		dispatch,
		onClose,
		onChange,
	}: {
		open: boolean;
		boxItem: PokemonBoxItem | null;
		isEdit: boolean;
		parameter: StrengthParameter;
		dispatch: (action: IvAction) => void;
		onClose: () => void;
		onChange: (value: PokemonBoxItem) => void;
	}) => {
		if (!isEdit) {
			boxItem = new PokemonBoxItem(
				new PokemonIv({ pokemonName: "Venusaur" }),
				undefined,
				undefined,
				-1,
			);
		}
		if (boxItem === null) {
			return null;
		}
		return (
			<StyledDialog
				open={open}
				onClose={onClose}
				fullScreen
				slots={{ transition: Transition }}
			>
				<BoxItemDialogContent
					originalBoxItem={boxItem}
					isEdit={isEdit}
					parameter={parameter}
					dispatch={dispatch}
					onClose={onClose}
					onChange={onChange}
				/>
			</StyledDialog>
		);
	},
);

const BoxItemDialogContent = React.memo(
	({
		originalBoxItem,
		isEdit,
		parameter,
		dispatch,
		onClose,
		onChange,
	}: {
		originalBoxItem: PokemonBoxItem;
		isEdit: boolean;
		parameter: StrengthParameter;
		dispatch: (action: IvAction) => void;
		onChange: (value: PokemonBoxItem) => void;
		onClose: () => void;
	}) => {
		const { t } = useTranslation();
		const [boxItem, setBoxItem] =
			React.useState<PokemonBoxItem>(originalBoxItem);

		const onCloseClick = React.useCallback(() => {
			if (isEdit) {
				onChange(boxItem);
			}
			onClose();
		}, [isEdit, onChange, onClose, boxItem]);
		const onSaveClick = React.useCallback(() => {
			if (!isEdit) {
				onChange(boxItem);
			}
			onClose();
		}, [isEdit, onChange, onClose, boxItem]);

		return (
			<>
				<BoxItemEditor
					boxItem={boxItem}
					isEdit={isEdit}
					parameter={parameter}
					dispatch={dispatch}
					onChange={setBoxItem}
				/>
				<DialogActions>
					<Button onClick={onCloseClick}>{t("close")}</Button>
					{!isEdit && <Button onClick={onSaveClick}>{t("add")}</Button>}
				</DialogActions>
			</>
		);
	},
);

const StyledDialog = styled(Dialog)({
	"& div.MuiDialog-paper": {
		"& > div.MuiDialogActions-root": {
			position: "fixed",
			padding: "0 0.5rem 1rem 0.5rem",
			margin: 0,
			background: "rgba(255, 255, 255, 0.8)",
			width: "calc(100% - 1rem)",
			bottom: 0,
		},
	},
});

/**
 * Form to edit a pokemon in the box (IV, nickname and shiny).
 *
 * The item is kept by the parent. `onChange` is called
 * with the edited item on every change.
 */
const BoxItemEditor = React.memo(
	({
		boxItem,
		isEdit,
		parameter,
		dispatch,
		onChange,
	}: {
		boxItem: PokemonBoxItem;
		isEdit: boolean;
		parameter: StrengthParameter;
		dispatch: (action: IvAction) => void;
		onChange: (value: PokemonBoxItem) => void;
	}) => {
		const { t } = useTranslation();
		const { iv, nickname } = boxItem;
		const rp = React.useMemo(() => new PokemonRp(iv).calculate().rp, [iv]);
		const [isEditingNickName, setIsEditingNickName] = React.useState(false);
		const localName = t(`pokemons.${iv.pokemonName}`);

		const notify = React.useCallback(
			(newIv: PokemonIv, newNickname: string) => {
				onChange(
					new PokemonBoxItem(
						newIv,
						newNickname,
						boxItem.attributes,
						boxItem.id,
					),
				);
			},
			[onChange, boxItem.attributes, boxItem.id],
		);

		const onFormChange = React.useCallback(
			(value: PokemonIv) => {
				notify(value, nickname === localName ? "" : nickname);
			},
			[localName, nickname, notify],
		);
		const onShinyClick = React.useCallback(() => {
			onFormChange(iv.clone({ shiny: !iv.shiny }));
		}, [iv, onFormChange]);
		const onNickNameChange = React.useCallback(
			(event: React.ChangeEvent<HTMLInputElement>) => {
				notify(iv, event.target.value);
			},
			[iv, notify],
		);
		const onNickNameFocus = React.useCallback(() => {
			setIsEditingNickName(true);
			if (nickname === "") {
				notify(iv, localName);
			}
		}, [iv, nickname, localName, notify]);
		const onNickNameBlur = React.useCallback(() => {
			setIsEditingNickName(false);
			if (nickname === localName) {
				notify(iv, "");
			}
		}, [iv, nickname, localName, notify]);

		let displayNickName = nickname;
		if (!isEditingNickName && nickname === "") {
			displayNickName = localName;
		}

		return (
			<StyledBoxItemEditor>
				<RpLabel rp={rp} iv={iv} />
				<header className="control">
					<TypeSpecialtyPanel
						type={iv.pokemon.type}
						specialty={iv.pokemon.specialty}
						level={iv.level}
						parameter={parameter}
						dispatch={dispatch}
					/>
					{!iv.isMythical && (
						<span className="shiny">
							<ToggleButton
								value="shiny"
								selected={iv.shiny}
								onClick={onShinyClick}
							>
								<AutoAwesomeIcon />
							</ToggleButton>
						</span>
					)}
				</header>
				<div className="icon">
					<ButtonBase onClick={onShinyClick}>
						<PokemonIcon idForm={iv.idForm} shiny={iv.shiny} size={80} />
					</ButtonBase>
				</div>
				<div className="nickname">
					<TextField
						variant="standard"
						size="small"
						value={displayNickName}
						onChange={onNickNameChange}
						onFocus={onNickNameFocus}
						onBlur={onNickNameBlur}
					/>
				</div>
				<IvForm
					parameter={parameter}
					pokemonIv={iv}
					fixMode={isEdit}
					dispatch={dispatch}
					onChange={onFormChange}
				/>
			</StyledBoxItemEditor>
		);
	},
);

const StyledBoxItemEditor = styled("article")({
	position: "relative",
	padding: ".5rem .5rem 4rem .5rem",

	"& > header.control": {
		position: "absolute",
		top: ".8rem",
		right: "1rem",
		"& > span.shiny": {
			"& > button": {
				border: 0,
				borderRadius: "1rem",
				margin: 0,
				padding: "4px",
				background: "#cccccc",
				color: "#ffffff",
				marginLeft: ".2rem",
				"& > svg": {
					width: 14,
					height: 14,
				},
				"&.Mui-selected": {
					background: "#ffcc00",
					color: "#ffffff",
				},
			},
		},
	},
	"& > div.icon": {
		margin: ".5rem auto .2rem",
		width: "82px",
		"& > button": {
			borderRadius: ".5rem",
		},
	},
	"& > div.nickname": {
		margin: "0 auto 1.2rem auto",
		width: "10rem",
		"& input": {
			fontSize: "1.2rem",
			fontWeight: "bold",
			textAlign: "center",
		},
	},
});

export default BoxItemDialog;
