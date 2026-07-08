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
import IvForm from "../IvForm/IvForm";
import type { IvAction } from "../IvState";
import BoxView from "./BoxView";

const BoxIvSelectDialog = React.memo(
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

		const onCloseHandler = React.useCallback(() => {
			if (tabIndex === 0) {
				onClose();
				return;
			}

			// Call onSelect when tabIndex === 1 on close
			onSelect(new PokemonBoxItem(pokemonIv));
			onClose();
		}, [onClose, onSelect, pokemonIv, tabIndex]);

		const onSelectHandler = React.useCallback(
			(id: number) => {
				const selected = items.find((x) => x.id === id);
				if (selected) {
					onSelect(selected);
					onClose();
				}
			},
			[items, onSelect, onClose],
		);

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

		React.useEffect(() => {
			if (open) {
				setPokemonIv(iv ?? new PokemonIv({ pokemonName: "Bulbasaur" }));
			}
		}, [iv, open]);

		if (!open) {
			return null;
		}

		return (
			<StyledDialog open={open} onClose={onCloseHandler}>
				<DialogTitle>
					<StyledTabs value={tabIndex} onChange={onTabChange}>
						<StyledTab label={t("pokemon")} value={0} />
						<StyledTab label={t("box")} value={1} />
					</StyledTabs>
					<IconButton onClick={onCloseHandler}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					{tabIndex === 0 && (
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
					{tabIndex === 1 && (
						<BoxView
							iv={pokemonIv}
							items={items}
							parameter={parameter}
							selectedId={-1}
							selectMode
							onSelect={onSelectHandler}
							dispatch={dispatch}
						/>
					)}
				</DialogContent>
				{tabIndex === 0 && (
					<DialogActions>
						<Button onClick={onReset} color="error">
							{t("reset")}
						</Button>
						<Button onClick={onCloseHandler}>{t("close")}</Button>
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

export default BoxIvSelectDialog;
