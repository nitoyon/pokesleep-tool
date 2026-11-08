import AddIcon from "@mui/icons-material/Add";
import { CircularProgress, Fab } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import PokemonBox, { type PokemonBoxItem } from "../../../util/Box/PokemonBox";
import BoxFilterConfig from "../../../util/Box/PokemonBoxFilter";
import {
	type BoxSortConfig,
	type BoxSortType,
	loadBoxSortConfig,
	sortPokemonItems,
} from "../../../util/Box/PokemonBoxSort";
import type PokemonIv from "../../../util/PokemonIv";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import CandyDialog from "../Dialog/CandyDialog";
import {
	type BoxDrawerPosition,
	type BoxStatus,
	defaultBoxDrawerPosition,
	type IvAction,
} from "../IvState";
import PokemonFilterFooter, {
	type PokemonFilterFooterConfig,
} from "../PokemonFilterFooter";
import BoxFilterDialog from "./BoxFilterDialog";
import BoxItemDrawer from "./BoxItemDrawer";
import BoxLargeItem from "./BoxLargeItem";
import BoxSortConfigFooter from "./BoxSortConfigFooter";

const BoxView = React.memo(
	({
		items,
		iv,
		status = "ready",
		selectMode,
		selectedId,
		parameter,
		dispatch,
		onSelect,
		editable = false,
		drawerPosition = defaultBoxDrawerPosition,
		footerAccessory,
	}: {
		items: PokemonBoxItem[];
		iv: PokemonIv;
		/**
		 * Status of the box. Shows a progress indicator while loading,
		 * and an error message when loading failed.
		 */
		status?: BoxStatus;
		selectMode?: boolean;
		selectedId: number;
		parameter: StrengthParameter;
		dispatch: (action: IvAction) => void;
		onSelect: (id: number) => void;
		/** Whether box items can be edited in the drawer. */
		editable?: boolean;
		/** Position where the drawer stopped last time. */
		drawerPosition?: BoxDrawerPosition;
		footerAccessory?: React.ReactNode;
	}) => {
		const { t } = useTranslation();
		const [sortConfig, setSortConfig] = React.useState(() =>
			loadBoxSortConfig(),
		);
		const [filterConfig, setFilterConfig] =
			React.useState<BoxFilterConfig>(boxFilterConfig);
		const [filterOpen, setFilterOpen] = React.useState(false);
		const [candyOpen, setCandyOpen] = React.useState(false);
		const selectedRef = React.useRef<HTMLDivElement | null>(null);

		const [addDrawerOpen, setAddDrawerOpen] = React.useState(false);
		const onAddClick = React.useCallback(() => {
			if (items.length >= PokemonBox.maxEntryCount) {
				dispatch({ type: "showAlert", payload: { message: "box is full" } });
				return;
			}
			setAddDrawerOpen(true);
		}, [items.length, dispatch]);
		const onAddDrawerClose = React.useCallback(() => {
			setAddDrawerOpen(false);
		}, []);

		const onFilterConfigChange = React.useCallback(
			(value: PokemonFilterFooterConfig) => {
				const newValue = {
					...sortConfig,
					sort: value.sort as BoxSortType,
					descending: value.descending,
				};
				setSortConfig(newValue);
				localStorage.setItem("PstPokemonBoxParam", JSON.stringify(newValue));
			},
			[sortConfig],
		);
		const onSortConfigChange = React.useCallback((value: BoxSortConfig) => {
			setSortConfig(value);
			localStorage.setItem("PstPokemonBoxParam", JSON.stringify(value));
		}, []);
		const onFilterButtonClick = React.useCallback(() => {
			setFilterOpen(true);
		}, []);
		const onFilterDialogClose = React.useCallback(() => {
			setFilterOpen(false);
		}, []);
		const onFilterChange = React.useCallback((value: BoxFilterConfig) => {
			boxFilterConfig = value;
			setFilterConfig(boxFilterConfig);
		}, []);
		const onCandyClick = React.useCallback(() => {
			setCandyOpen(true);
		}, []);
		const onCandyDialogClose = React.useCallback(() => {
			setCandyOpen(false);
		}, []);
		const onIvChange = React.useCallback(
			(iv: PokemonIv) => {
				const selectedItem = items.find((x) => x.id === selectedId);
				if (selectedItem !== undefined) {
					dispatch({ type: "updateIv", payload: { iv } });
				}
			},
			[items, dispatch, selectedId],
		);

		// filter
		const filtered = React.useMemo(
			() => filterConfig.filter(items, parameter.evolved, t),
			[items, filterConfig, parameter.evolved, t],
		);

		// sort
		const [sortedItems, errorMessage] = React.useMemo(
			() =>
				sortPokemonItems(
					filtered,
					sortConfig.sort,
					sortConfig.descending,
					sortConfig.ingredient,
					sortConfig.mainSkill,
					parameter,
					t,
				),
			[
				sortConfig.sort,
				sortConfig.descending,
				sortConfig.ingredient,
				sortConfig.mainSkill,
				filtered,
				parameter,
				t,
			],
		);
		const orderedItems = React.useMemo(
			() => (sortConfig.descending ? sortedItems : [...sortedItems].reverse()),
			[sortedItems, sortConfig.descending],
		);

		// Drawer to edit an item
		const [drawer, setDrawer] = React.useState<{
			open: boolean;
			id: number;
			ids: number[];
		}>({ open: false, id: -1, ids: [] });
		const onEditHandler = React.useCallback(
			(id: number) => {
				setDrawer({ open: true, id, ids: orderedItems.map((x) => x.id) });
			},
			[orderedItems],
		);
		const onEdit = editable ? onEditHandler : undefined;
		const onDrawerItemChange = React.useCallback(
			(id: number) => {
				setDrawer((x) => ({ ...x, id }));
				onSelect(id);
			},
			[onSelect],
		);
		const onDrawerClose = React.useCallback(() => {
			setDrawer((x) => ({ ...x, open: false }));
		}, []);

		const elms = React.useMemo(
			() =>
				orderedItems.map((item) => (
					<BoxLargeItem
						key={item.id}
						item={item}
						selected={item.id === selectedId}
						dispatch={dispatch}
						onCandyClick={onCandyClick}
						onSelect={onSelect}
						onEdit={onEdit}
						selectedRef={item.id === selectedId ? selectedRef : undefined}
					/>
				)),
			[orderedItems, dispatch, onCandyClick, selectedId, onSelect, onEdit],
		);

		React.useEffect(() => {
			selectedRef.current?.scrollIntoView({ block: "center" });
		}, []);

		const footerValue = React.useMemo(
			() => ({
				isFiltered: !filterConfig.isEmpty,
				sort: sortConfig.sort,
				descending: sortConfig.descending,
			}),
			[filterConfig, sortConfig],
		);
		const footerSortTypes = React.useMemo(
			() => [
				"level",
				"name",
				"pokedexno",
				"rp",
				"total strength",
				"berry",
				"ingredient",
				"skill",
			],
			[],
		);

		return (
			<>
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						margin: selectMode ? "0.8rem 0 300px 0" : "0 0.5rem 300px 0.5rem",
						width: selectMode ? "100%" : "calc(100% - 1rem)",
					}}
				>
					{status === "loading" && (
						<div style={{ margin: "5rem auto 0" }}>
							<CircularProgress />
						</div>
					)}
					{status !== "loading" && elms.length === 0 && (
						<div
							style={{
								margin: "5rem auto 0",
								color: "#888",
								fontSize: "0.9rem",
							}}
						>
							{status === "error"
								? t("failed to load box")
								: items.length === 0
									? t("box is empty")
									: errorMessage}
						</div>
					)}
					{elms}
				</div>
				<div
					style={{
						position: selectMode ? "sticky" : "fixed",
						width: "100%",
						bottom: 0,
						margin: ".5rem 0 0",
					}}
				>
					{!selectMode && status === "ready" && (
						<Fab
							onClick={onAddClick}
							color="primary"
							size="medium"
							sx={{ position: "absolute", top: "-55px", right: "10px" }}
						>
							<AddIcon />
						</Fab>
					)}
					<BoxSortConfigFooter
						parameter={parameter}
						sortConfig={sortConfig}
						sx={{ paddingLeft: selectMode ? "0.8rem" : "1.2rem" }}
						dispatch={dispatch}
						onChange={onSortConfigChange}
					/>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							paddingLeft: selectMode ? 0 : "1rem",
							paddingBottom: selectMode ? 0 : "1.2rem",
							background: "#f76",
							width: selectMode ? "100%" : "calc(100% - 1rem)",
						}}
					>
						<PokemonFilterFooter
							value={footerValue}
							onChange={onFilterConfigChange}
							onFilterButtonClick={onFilterButtonClick}
							sortTypes={footerSortTypes}
						/>
						{footerAccessory !== undefined && (
							<div style={{ margin: "0 0.8rem 0 auto" }}>{footerAccessory}</div>
						)}
					</div>
				</div>
				<BoxFilterDialog
					open={filterOpen}
					onClose={onFilterDialogClose}
					value={filterConfig}
					onChange={onFilterChange}
				/>
				{!selectMode && (
					<BoxItemDrawer
						mode="add"
						pokemonIv={iv}
						selectedItemId={selectedId}
						open={addDrawerOpen}
						position={drawerPosition}
						parameter={parameter}
						dispatch={dispatch}
						onClose={onAddDrawerClose}
					/>
				)}
				{editable && (
					<BoxItemDrawer
						mode="edit"
						open={drawer.open}
						position={drawerPosition}
						items={items}
						orderedIds={drawer.ids}
						itemId={drawer.id}
						parameter={parameter}
						dispatch={dispatch}
						onItemChange={onDrawerItemChange}
						onClose={onDrawerClose}
					/>
				)}
				<CandyDialog
					iv={iv}
					open={candyOpen}
					dstLevel={parameter.level === 0 ? undefined : parameter.level}
					onChange={onIvChange}
					onClose={onCandyDialogClose}
				/>
			</>
		);
	},
);

/**
 * Cache for latest filter config
 *
 * This global variable persists the filter config across tab switches.
 * Without it, BoxFilterConfig would be cleared when the [Box] tab is unselected.
 */
let boxFilterConfig = new BoxFilterConfig({});

export default BoxView;
