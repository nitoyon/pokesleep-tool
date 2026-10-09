import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Snackbar,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import type { IvAction } from "../IvState";

const BoxDeleteAllDialog = React.memo(
	({
		open,
		dispatch,
		onClose,
	}: {
		dispatch: (action: IvAction) => void;
		open: boolean;
		onClose: () => void;
	}) => {
		const [deletedMessageVisible, setDeletedMessageVisible] =
			React.useState(false);
		const { t } = useTranslation();

		const onDelete = React.useCallback(() => {
			dispatch({ type: "removeAllItems" });
			setDeletedMessageVisible(true);
			onClose();
		}, [dispatch, onClose]);
		const onDeletedMessageClose = React.useCallback(() => {
			setDeletedMessageVisible(false);
		}, []);

		return (
			<>
				<Dialog open={open} onClose={onClose}>
					<DialogTitle>{t("delete all")}</DialogTitle>
					<DialogContent>
						<p style={{ fontSize: "0.9rem", margin: 0 }}>
							{t("delete all message")}
						</p>
					</DialogContent>
					<DialogActions>
						<Button onClick={onDelete} color="error">
							{t("delete")}
						</Button>
						<Button onClick={onClose}>{t("cancel")}</Button>
					</DialogActions>
				</Dialog>
				<Snackbar
					open={deletedMessageVisible}
					autoHideDuration={2000}
					onClose={onDeletedMessageClose}
					message={t("deleted all pokemon")}
				/>
			</>
		);
	},
);
export default BoxDeleteAllDialog;
