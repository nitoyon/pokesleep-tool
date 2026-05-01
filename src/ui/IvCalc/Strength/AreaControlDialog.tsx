import React from "react";
import { styled } from "@mui/system";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import AreaControlGroup from "./AreaControlGroup";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import { useTranslation } from "react-i18next";

const AreaControlDialog = React.memo(
	({
		open,
		value,
		onChange,
		onClose,
	}: {
		open: boolean;
		value: StrengthParameter;
		onChange: (value: StrengthParameter) => void;
		onClose: () => void;
	}) => {
		const { t } = useTranslation();
		if (!open) {
			return null;
		}

		return (
			<Dialog open={open} onClose={onClose}>
				<StyledDialogContent>
					<AreaControlGroup value={value} onChange={onChange} />
				</StyledDialogContent>
				<DialogActions>
					<Button onClick={onClose}>{t("close")}</Button>
				</DialogActions>
			</Dialog>
		);
	},
);

const StyledDialogContent = styled(DialogContent)({
	minWidth: "16rem",
	paddingBottom: 0,
	fontSize: "0.9rem",
	"& section": {
		"& > span.lbl": {
			paddingTop: "1rem",
			display: "block",
		},
		"&.first > span.lbl": {
			paddingTop: 0,
		},
		"& > span.MuiSwitch-root, & > div, & > button:first-of-type": {
			marginLeft: "1rem",
			fontSize: "0.9rem",
		},
	},
});

export default AreaControlDialog;
