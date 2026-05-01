import {
	ClickAwayListener,
	Paper,
	Popper,
	type PopperPlacementType,
} from "@mui/material";
import React from "react";

const PopperMenu = React.memo(
	({
		anchorEl,
		children,
		placement,
		open,
		onClose,
	}: {
		anchorEl: HTMLElement | null;
		children: React.ReactElement;
		placement?: PopperPlacementType;
		open: boolean;
		onClose: () => void;
	}) => {
		const onClickAway = React.useCallback(
			(e: MouseEvent | TouchEvent) => {
				// if clicking inside the anchor element, do nothing
				if (anchorEl?.contains(e.target as Node)) {
					return;
				}

				// if anchorEl is clicked, we shouldn't reopen the popper
				if (e.target === anchorEl) {
					return;
				}
				onClose();
			},
			[anchorEl, onClose],
		);

		return (
			<Popper
				open={open}
				anchorEl={anchorEl}
				placement={placement ?? "bottom-start"}
				style={{ zIndex: 2147483647, maxWidth: "95vw" }}
			>
				<Paper elevation={10}>
					<ClickAwayListener onClickAway={onClickAway}>
						{children}
					</ClickAwayListener>
				</Paper>
			</Popper>
		);
	},
);

export default PopperMenu;
