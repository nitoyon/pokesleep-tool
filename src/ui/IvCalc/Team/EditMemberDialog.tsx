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
import type { MemberAction } from "./MemberEvent";

const EditMemberDialog = React.memo(
	({
		action,
		items,
		item,
		parameter,
		open,
		dispatch,
		onClose,
		onSelect,
	}: {
		action: MemberAction;
		items: PokemonBoxItem[];
		item?: PokemonBoxItem;
		parameter: StrengthParameter;
		open: boolean;
		dispatch: (action: IvAction) => void;
		onClose: () => void;
		onSelect: (item: PokemonBoxItem) => void;
	}) => {
		const { t } = useTranslation();
		const openRef = React.useRef(open);
		const [tabIndex, setTabIndex] = React.useState(0);
		const [pokemonIv, setPokemonIv] = React.useState<PokemonIv>(
			item?.iv ?? new PokemonIv({ pokemonName: "Bulbasaur" }),
		);

		// Initialize dialog
		React.useEffect(() => {
			// execute only after this dialog is opened
			if (!(open && !openRef.current)) {
				openRef.current = open;
				return;
			}
			openRef.current = open;

			// set iv
			if (item !== undefined) {
				setPokemonIv(item.iv);
			}

			// set tabIndex
			if (action === "openbox") {
				setTabIndex(0);
			} else if (action === "editiv") {
				setTabIndex(1);
			} else if (action === "add") {
				// if box is not empty, open box
				setTabIndex(items.length > 0 ? 0 : 1);
			}
		});

		const onAdd = React.useCallback(() => {
			onSelect(new PokemonBoxItem(pokemonIv));
			onClose();
		}, [onClose, onSelect, pokemonIv]);

		const onBoxSelect = React.useCallback(
			(id: number) => {
				dispatch({ type: "select", payload: { id } });
			},
			[dispatch],
		);

		const onCloseHook = React.useCallback(() => {
			if (tabIndex === 0) {
				onClose();
				return;
			}

			// Call onSelect when tabIndex === 1 on close
			onSelect(new PokemonBoxItem(pokemonIv, item?.nickname));
			onClose();
		}, [item, onClose, onSelect, pokemonIv, tabIndex]);

		const onReset = React.useCallback(() => {
			if (item !== undefined) {
				setPokemonIv(item.iv);
			}
		}, [item]);

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
							onSelect={onBoxSelect}
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
						{item !== undefined && (
							<>
								<Button onClick={onReset} color="error">
									{t("reset")}
								</Button>
								<Button onClick={onCloseHook}>{t("close")}</Button>
							</>
						)}
						{item === undefined && <Button onClick={onAdd}>{t("add")}</Button>}
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
