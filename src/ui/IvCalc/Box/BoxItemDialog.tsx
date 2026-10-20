import { Button, Dialog, DialogActions } from "@mui/material";
import Slide from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { PokemonBoxItem } from "../../../util/Box/PokemonBox";
import PokemonIv from "../../../util/PokemonIv";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import type { IvAction } from "../IvState";
import BoxItemEditor from "./BoxItemEditor";

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

export default BoxItemDialog;
