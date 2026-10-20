import React from "react";
import type { PokemonBoxItem } from "../../../util/Box/PokemonBox";
import type { SaveStatus } from "../../../util/Box/SaveTracker";
import type PokemonIv from "../../../util/PokemonIv";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import type { BoxDrawerPosition, BoxStatus, IvAction } from "../IvState";
import BoxView from "./BoxView";
import CloudBoxStatus from "./CloudBoxStatus";

const BoxTabChild = React.memo(
	({
		items,
		iv,
		status,
		saveStatus,
		selectedId,
		drawerPosition,
		parameter,
		dispatch,
	}: {
		items: PokemonBoxItem[];
		iv: PokemonIv;
		status: BoxStatus;
		saveStatus: SaveStatus;
		selectedId: number;
		drawerPosition: BoxDrawerPosition;
		parameter: StrengthParameter;
		dispatch: (action: IvAction) => void;
	}) => {
		const onSelect = React.useCallback(
			(id: number) => {
				dispatch({ type: "select", payload: { id } });
			},
			[dispatch],
		);
		const onReload = React.useCallback(() => {
			dispatch({ type: "reloadBox" });
		}, [dispatch]);
		const footerAccessory = React.useMemo(
			() => <CloudBoxStatus status={saveStatus} onReload={onReload} />,
			[saveStatus, onReload],
		);

		return (
			<BoxView
				items={items}
				iv={iv}
				status={status}
				selectedId={selectedId}
				parameter={parameter}
				dispatch={dispatch}
				onSelect={onSelect}
				editable
				drawerPosition={drawerPosition}
				footerAccessory={footerAccessory}
			/>
		);
	},
);

export default BoxTabChild;
