import CloseIcon from "@mui/icons-material/Close";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Tab,
	Tabs,
} from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { PokemonBoxItem } from "../../../util/PokemonBox";
import PokemonIv from "../../../util/PokemonIv";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import BoxView from "../Box/BoxView";
import IvForm from "../IvForm/IvForm";
import type { IvAction } from "../IvState";

const EditMemberDialog = React.memo(
	({
		items,
		iv,
		parameter,
		open,
		dispatch,
		onClose,
		onSelect,
	}: {
		items: PokemonBoxItem[];
		iv?: PokemonIv;
		parameter: StrengthParameter;
		open: boolean;
		dispatch: (action: IvAction) => void;
		onClose: () => void;
		onSelect: (item: PokemonBoxItem) => void;
	}) => {
		const { t } = useTranslation();
		const [tabIndex, setTabIndex] = React.useState(0);
		const [pokemonIv, setPokemonIv] = React.useState<PokemonIv>(
			iv ?? new PokemonIv({ pokemonName: "Bulbasaur" }),
		);

		const onAdd = React.useCallback(() => {
			onSelect(new PokemonBoxItem(pokemonIv));
			onClose();
		}, [onClose, onSelect, pokemonIv]);

		const onCloseHook = React.useCallback(() => {
			if (tabIndex === 0) {
				onClose();
				return;
			}

			// Call onSelect when tabIndex === 1 on close
			onSelect(new PokemonBoxItem(pokemonIv));
			onClose();
		}, [onClose, onSelect, pokemonIv, tabIndex]);

		const onReset = React.useCallback(() => {
			if (iv !== undefined) {
				setPokemonIv(iv);
			}
		}, [iv]);

		const onTabChange = React.useCallback(
			(_event: React.SyntheticEvent, newValue: number) => {
				setTabIndex(newValue);
			},
			[],
		);

		const onIvChange = React.useCallback((value: PokemonIv) => {
			setPokemonIv(value);
		}, []);

		const dispatchHook = React.useCallback(
			(action: IvAction) => {
				if (action.type !== "select") {
					return;
				}

				// Hook select action to forward the item instead of dispatching
				const item = items.find((x) => x.id === action.payload.id);
				if (item !== undefined) {
					onSelect(item);
					onClose();
				}
			},
			[items, onClose, onSelect],
		);

		return (
			<StyledDialog open={open} onClose={onCloseHook}>
				<DialogTitle>
					<StyledTabs value={tabIndex} onChange={onTabChange}>
						<StyledTab label={t("box")} value={0} />
						<StyledTab label={t("pokemon")} value={1} />
					</StyledTabs>
					<IconButton onClick={onCloseHook}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					{tabIndex === 0 && (
						<BoxView
							iv={pokemonIv}
							items={items}
							parameter={parameter}
							selectedId={-1}
							selectMode
							dispatch={dispatchHook}
						/>
					)}
					{tabIndex === 1 && (
						<div style={{ margin: "0.5rem 0.5rem 0" }}>
							<IvForm
								dispatch={dispatch}
								hideCandyButton
								parameter={parameter}
								pokemonIv={pokemonIv}
								onChange={onIvChange}
							/>
						</div>
					)}
				</DialogContent>
				{tabIndex === 1 && (
					<DialogActions>
						{iv !== undefined && (
							<>
								<Button onClick={onReset} color="error">
									{t("reset")}
								</Button>
								<Button onClick={onCloseHook}>{t("close")}</Button>
							</>
						)}
						{iv === undefined && <Button onClick={onAdd}>{t("add")}</Button>}
					</DialogActions>
				)}
			</StyledDialog>
		);
	},
);

const StyledDialog = styled(Dialog)({
	"& > div.MuiDialog-container > div.MuiPaper-root": {
		width: "100%",
		maxHeight: "min(800px, 80%)",
		margin: "20px",
		position: "relative",
		"& > h2": {
			padding: "0 10px",
			"& > button": {
				position: "absolute",
				right: 2,
				top: 2,
			},
		},
		"& > div.MuiDialogContent-root": {
			padding: 0,
		},
	},
});

const StyledTabs = styled(Tabs)({
	minHeight: "40px",
	marginBottom: ".3rem",
});

const StyledTab = styled(Tab)({
	minHeight: "40px",
	padding: "6px 16px",
});

export default EditMemberDialog;
