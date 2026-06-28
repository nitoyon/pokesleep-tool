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
type BoxExportDestination = "clipboard" | "file";

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
		const [destination, setDestination] =
			React.useState<BoxExportDestination>("clipboard");
		const { t } = useTranslation();

		const value = React.useMemo(() => {
			if (format === "custom") {
				return box.items.map((x) => x.serialize()).join("\n");
			}
			return exportToCsvTsv(box.items, t, format);
		}, [box.items, format, t]);

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

		const onFormatChange = React.useCallback((value: string) => {
			setFormat(value as BoxExportFormat);
		}, []);

		const onDestinationChange = React.useCallback((value: string) => {
			setDestination(value as BoxExportDestination);
		}, []);

		const onExport = React.useCallback(() => {
			if (destination === "clipboard") {
				onCopy();
			} else {
				exportToFile(value, format);
			}
		}, [destination, onCopy, format, value]);

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
						slotProps={{ htmlInput: { wrap: "off" } }}
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
					<div
						style={{
							marginTop: "0.2rem",
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
							{t("output destination")}:
						</span>
						<SelectEx value={destination} onChange={onDestinationChange}>
							<MenuItem value="clipboard">{t("clipboard")}</MenuItem>
							<MenuItem value="file">{t("file")}</MenuItem>
						</SelectEx>
					</div>
				</DialogContent>
				<DialogActions>
					<Button onClick={onExport}>{t("export")}</Button>
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

function exportToFile(value: string, format: BoxExportFormat) {
	const ext = format === "custom" ? "txt" : format;
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	const timestamp =
		`${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
		`${pad(now.getHours())}${pad(now.getMinutes())}`;
	const filename = `box${timestamp}.${ext}`;
	const blob = new Blob([value], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

export default BoxExportDialog;
