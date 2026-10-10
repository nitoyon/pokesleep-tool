import BackupIcon from "@mui/icons-material/Backup";
import CloudIcon from "@mui/icons-material/Cloud";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import { IconButton } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import type { SaveStatus } from "../../../util/Box/SaveTracker";
import { useAuthUser } from "../../common/Hook";
import ConfirmDialog from "../../Dialog/ConfirmDialog";
import MessageDialog from "../../Dialog/MessageDialog";

/**
 * Shows the status of saving the box to the cloud.
 */
const CloudBoxStatus = React.memo(({ status }: { status: SaveStatus }) => {
	const { t } = useTranslation();
	const { user, signIn } = useAuthUser();
	const [noticeOpen, setNoticeOpen] = React.useState(false);
	const [authErrorMessage, setAuthErrorMessage] = React.useState<string | null>(
		null,
	);

	const onClick = React.useCallback(() => {
		setNoticeOpen(true);
	}, []);
	const onNoticeClose = React.useCallback(() => {
		setNoticeOpen(false);
	}, []);
	const onLoginClick = React.useCallback(() => {
		signIn().catch((error) => {
			setAuthErrorMessage(error.message);
		});
	}, [signIn]);
	const onAuthErrorDialogClose = React.useCallback(() => {
		setAuthErrorMessage(null);
	}, []);

	// shows nothing while the sign-in state is not yet known
	if (user === undefined) {
		return null;
	}
	const icon =
		user === null ? (
			<CloudOffIcon />
		) : status === "saving" ? (
			<BackupIcon titleAccess={t("box saving")} />
		) : status === "saved" ? (
			<CloudDoneIcon titleAccess={t("box saved")} />
		) : (
			<CloudIcon />
		);
	return (
		<>
			<IconButton
				onClick={onClick}
				size="small"
				sx={{ color: "white", marginRight: "0.3rem" }}
			>
				{icon}
			</IconButton>
			{user === null ? (
				<ConfirmDialog
					open={noticeOpen}
					message={
						<>
							<p>{t("export message1")}</p>
							<p>{t("box sync notice")}</p>
						</>
					}
					okLabel={t("login")}
					okColor="primary"
					okContained
					onOk={onLoginClick}
					onClose={onNoticeClose}
				/>
			) : (
				<MessageDialog
					open={noticeOpen}
					message={t("box synced notice")}
					onClose={onNoticeClose}
				/>
			)}
			<MessageDialog
				open={authErrorMessage !== null}
				message={authErrorMessage}
				onClose={onAuthErrorDialogClose}
			/>
		</>
	);
});

export default CloudBoxStatus;
