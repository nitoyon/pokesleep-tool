import { Dialog } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import type { PokemonBoxItem } from "../../../util/PokemonBox";
import PokemonIv from "../../../util/PokemonIv";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import BoxView from "../Box/BoxView";
import type { IvAction } from "../IvState";

const EditMemberDialog = React.memo(
	({
		items,
		parameter,
		open,
		dispatch,
		onClose,
		onSelect,
	}: {
		items: PokemonBoxItem[];
		parameter: StrengthParameter;
		open: boolean;
		dispatch: (action: IvAction) => void;
		onClose: () => void;
		onSelect: (item: PokemonBoxItem) => void;
	}) => {
		const dispatchHook = React.useCallback(
			(action: IvAction) => {
				if (action.type !== "select") {
					dispatch(action);
					return;
				}

				// Hook select action to forward the item instead of dispatching
				const item = items.find((x) => x.id === action.payload.id);
				if (item !== undefined) {
					onSelect(item);
					onClose();
				}
			},
			[dispatch, items, onClose, onSelect],
		);

		const iv = new PokemonIv({ pokemonName: "Bulbasaur" });
		return (
			<StyledDialog open={open} onClose={onClose}>
				<BoxView
					iv={iv}
					items={items}
					parameter={parameter}
					selectedId={-1}
					selectMode
					dispatch={dispatchHook}
				/>
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
	},
});

export default EditMemberDialog;
