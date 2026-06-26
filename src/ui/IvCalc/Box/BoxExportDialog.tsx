import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	MenuItem,
	Snackbar,
	TextField,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { copyToClipboard } from "../../../util/Clipboard";
import { exportToCsvTsv } from "../../../util/Formatter/BoxExporter";
import type PokemonBox from "../../../util/PokemonBox";
import SelectEx from "../../common/SelectEx";

type BoxExportFormat = "custom" | "csv" | "tsv";

const BoxExportDialog = React.memo(
	({
		box,
		open,
		onClose,
	}: {
		box: PokemonBox;
		open: boolean;
		onClose: () => void;
	}) => {
		const [copiedMessageVisible, setCopiedMessageVisible] =
			React.useState(false);
		const [format, setFormat] = React.useState<BoxExportFormat>("custom");
		const { t } = useTranslation();

		const value = React.useMemo(() => {
			if (format === "custom") {
				return box.items.map((x) => x.serialize()).join("\n");
			}
			return exportToCsvTsv(box.items, t, format);
		}, [box.items, format, t]);

		const onFormatChange = React.useCallback((value: string) => {
			setFormat(value as BoxExportFormat);
		}, []);

		const onCopy = React.useCallback(() => {
			copyToClipboard(value)
				.then(() => {
					setCopiedMessageVisible(true);
				})
				.catch(() => {});
		}, [value]);
		const onCopiedMessageClose = React.useCallback(() => {
			setCopiedMessageVisible(false);
		}, []);

		return (
			<Dialog open={open} onClose={onClose}>
				<DialogTitle>{t("export")}</DialogTitle>
				<DialogContent>
					<p style={{ fontSize: "0.9rem", margin: 0 }}>
						{t("export message1")}
					</p>
					<p style={{ fontSize: "0.9rem", margin: "0.5rem 0 1rem 0" }}>
						{t("export message2")}
					</p>
					<TextField
						label={t("box data")}
						multiline
						fullWidth
						rows={6}
						value={value}
					/>
					<div
						style={{
							marginTop: "1.2rem",
							display: "flex",
							flex: "0 auto",
						}}
					>
						<span
							style={{
								fontSize: "0.9rem",
								marginRight: "auto",
							}}
						>
							{t("output format")}:
						</span>
						<SelectEx value={format} onChange={onFormatChange}>
							<MenuItem value="custom">{t("custom format")}</MenuItem>
							<MenuItem value="csv">CSV</MenuItem>
							<MenuItem value="tsv">TSV</MenuItem>
						</SelectEx>
					</div>
				</DialogContent>
				<DialogActions>
					<Button onClick={onCopy}>{t("copy to clipboard")}</Button>
					<Button onClick={onClose}>{t("close")}</Button>
				</DialogActions>
				<Snackbar
					open={copiedMessageVisible}
					autoHideDuration={2000}
					onClose={onCopiedMessageClose}
					message={t("copied to clipboard")}
				/>
			</Dialog>
		);
	},
);

export default BoxExportDialog;
