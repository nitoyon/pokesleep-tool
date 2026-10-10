import {
	Button,
	type ButtonProps,
	Dialog,
	DialogActions,
	DialogContent,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

const ConfirmDialog = React.memo(
	({
		okLabel,
		okColor = "error",
		okContained = false,
		message,
		open,
		onOk,
		onClose,
	}: {
		okLabel: string;
		/** Color of the OK button. */
		okColor?: ButtonProps["color"];
		/** Whether the OK button is a contained button. */
		okContained?: boolean;
		open: boolean;
		message: React.ReactNode;
		onOk: () => void;
		onClose: () => void;
	}) => {
		const { t } = useTranslation();
		const okHandler = React.useCallback(() => {
			onOk();
			onClose();
		}, [onOk, onClose]);

		if (!open) {
			return null;
		}
		return (
			<Dialog open={open} onClose={onClose}>
				<DialogContent style={{ paddingBottom: 0 }}>{message}</DialogContent>
				<DialogActions>
					<Button
						onClick={okHandler}
						color={okColor}
						variant={okContained ? "contained" : "text"}
					>
						{okLabel}
					</Button>
					<Button onClick={onClose} autoFocus>
						{t("cancel")}
					</Button>
				</DialogActions>
			</Dialog>
		);
	},
);

export default ConfirmDialog;
