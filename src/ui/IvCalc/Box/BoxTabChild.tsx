import React from "react";
import type { PokemonBoxItem } from "../../../util/Box/PokemonBox";
import type { SaveStatus } from "../../../util/Box/SaveTracker";
import type PokemonIv from "../../../util/PokemonIv";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import type { BoxStatus, IvAction } from "../IvState";
import BoxView from "./BoxView";
import CloudBoxStatus from "./CloudBoxStatus";

const BoxTabChild = React.memo(
	({
		items,
		iv,
		status,
		saveStatus,
		selectedId,
		parameter,
		dispatch,
	}: {
		items: PokemonBoxItem[];
		iv: PokemonIv;
		status: BoxStatus;
		saveStatus: SaveStatus;
		selectedId: number;
		parameter: StrengthParameter;
		dispatch: (action: IvAction) => void;
	}) => {
		const onSelect = React.useCallback(
			(id: number) => {
				dispatch({ type: "select", payload: { id } });
			},
			[dispatch],
		);
		const onEdit = React.useCallback(
			(id: number) => {
				dispatch({ type: "edit", payload: { id } });
			},
			[dispatch],
		);
		const footerAccessory = React.useMemo(
			() => <CloudBoxStatus status={saveStatus} />,
			[saveStatus],
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
				onEdit={onEdit}
				footerAccessory={footerAccessory}
			/>
		);
	},
);

export default BoxTabChild;
