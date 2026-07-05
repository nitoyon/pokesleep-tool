import React from "react";
import type { PokemonBoxItem } from "../../../util/PokemonBox";
import type PokemonIv from "../../../util/PokemonIv";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import type { IvAction } from "../IvState";
import BoxView from "./BoxView";

const BoxTabChild = React.memo(
	({
		items,
		iv,
		selectedId,
		parameter,
		dispatch,
	}: {
		items: PokemonBoxItem[];
		iv: PokemonIv;
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

		return (
			<BoxView
				items={items}
				iv={iv}
				selectedId={selectedId}
				parameter={parameter}
				dispatch={dispatch}
				onSelect={onSelect}
				onEdit={onEdit}
			/>
		);
	},
);

export default BoxTabChild;
