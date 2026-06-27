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
import type { TFunction } from "i18next";
import React from "react";
import { useTranslation } from "react-i18next";
import {
	detectFormat,
	type ImportWarning,
	importFromCsvTsv,
} from "../../../util/Formatter/BoxImporter";
import type PokemonBox from "../../../util/PokemonBox";
import SelectEx from "../../common/SelectEx";

type BoxImportMethod = "clipboard" | "file";

const BoxImportDialog = React.memo(
	({
		box,
		open,
		onClose,
	}: {
		box: PokemonBox;
		open: boolean;
		onClose: () => void;
	}) => {
		const [value, setValue] = React.useState("");
		const [method, setMethod] = React.useState<BoxImportMethod>("clipboard");
		const [importedMessage, setImportedMessage] = React.useState("");
		const [warnings, setWarnings] = React.useState<ImportWarning[]>([]);
		const [importedCount, setImportedCount] = React.useState(0);
		const [warningDetailOpen, setWarningDetailOpen] = React.useState(false);
		const fileInputRef = React.useRef<HTMLInputElement>(null);
		const { t } = useTranslation();

		const onValueChange = React.useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				setValue(e.target.value);
			},
			[],
		);

		const onMethodChange = React.useCallback((v: string) => {
			setMethod(v as BoxImportMethod);
			setValue("");
		}, []);

		const onFileButtonClick = React.useCallback(() => {
			fileInputRef.current?.click();
		}, []);

		const onClose_ = React.useCallback(() => {
			setValue("");
			onClose();
		}, [onClose]);

		const importHandler = React.useCallback(
			(text: string) => {
				const result = importToBox(text, box, t);
				if (result.added === 0 && result.warnings.length === 0) {
					setImportedMessage(t("failed to import"));
					return;
				}
				if (result.added > 0) {
					box.save();
				}
				if (result.warnings.length > 0) {
					setWarnings(result.warnings);
					setImportedCount(result.added);
					setWarningDetailOpen(true);
				} else {
					setImportedMessage(t("imported N pokemon", { n: result.added }));
				}
				onClose_();
			},
			[box, t, onClose_],
		);

		const onImportClick = React.useCallback(() => {
			importHandler(value);
		}, [importHandler, value]);

		const onFileChange = React.useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				const file = e.target.files?.[0];
				if (!file) return;
				const reader = new FileReader();
				reader.onload = (ev) => {
					importHandler((ev.target?.result as string) ?? "");
				};
				reader.readAsText(file);
				e.target.value = "";
			},
			[importHandler],
		);

		const onImportedMessageClose = React.useCallback(() => {
			setImportedMessage("");
		}, []);

		const onWarningDetailClose = React.useCallback(() => {
			setWarningDetailOpen(false);
			setWarnings([]);
			setImportedCount(0);
		}, []);

		const importedMessageVisible = importedMessage !== "";

		return (
			<>
				<Dialog open={open} onClose={onClose_}>
					<DialogTitle>{t("import")}</DialogTitle>
					<DialogContent>
						<p style={{ fontSize: "0.9rem", margin: "0 0 1rem 0" }}>
							{method === "clipboard"
								? t("import message clipboard")
								: t("import message file")}
						</p>
						<p style={{ fontSize: "0.9rem", margin: "1rem 0" }}>
							{t("import message notice")}
						</p>
						{method === "clipboard" ? (
							<TextField
								label={t("box data")}
								multiline
								fullWidth
								rows={6}
								value={value}
								onChange={onValueChange}
								slotProps={{ htmlInput: { wrap: "off" } }}
							/>
						) : (
							<>
								<input
									ref={fileInputRef}
									type="file"
									accept=".txt,.csv,.tsv"
									style={{ display: "none" }}
									onChange={onFileChange}
								/>
								<Button variant="outlined" onClick={onFileButtonClick}>
									{t("select file")}
								</Button>
							</>
						)}
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
								{t("import method")}:
							</span>
							<SelectEx value={method} onChange={onMethodChange}>
								<MenuItem value="clipboard">{t("clipboard")}</MenuItem>
								<MenuItem value="file">{t("file")}</MenuItem>
							</SelectEx>
						</div>
					</DialogContent>
					<DialogActions>
						{method === "clipboard" && (
							<Button onClick={onImportClick}>{t("import")}</Button>
						)}
						<Button onClick={onClose_}>{t("close")}</Button>
					</DialogActions>
				</Dialog>
				<Snackbar
					open={importedMessageVisible}
					autoHideDuration={2000}
					onClose={onImportedMessageClose}
					message={importedMessage}
				/>
				<ImportWarningDialog
					open={warningDetailOpen}
					onClose={onWarningDetailClose}
					warnings={warnings}
					importedCount={importedCount}
				/>
			</>
		);
	},
);

function ImportWarningDialog({
	open,
	onClose,
	warnings,
	importedCount,
}: {
	open: boolean;
	onClose: () => void;
	warnings: ImportWarning[];
	importedCount: number;
}) {
	const { t } = useTranslation();
	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>
				{t("N items failed to read", { n: warnings.length })}
			</DialogTitle>
			<DialogContent>
				{importedCount > 0 && (
					<p>{t("imported N pokemon", { n: importedCount })}</p>
				)}
				<p>{t("failed to read detail")}</p>
				<ul>
					{warnings.map((w) => (
						<li key={w.row}>
							{t("row N", { row: w.row })}
							{w.message ?? ""}
						</li>
					))}
				</ul>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>{t("close")}</Button>
			</DialogActions>
		</Dialog>
	);
}

function importToBox(
	value: string,
	box: PokemonBox,
	t: TFunction,
): { added: number; warnings: ImportWarning[] } {
	const detectedFormat = detectFormat(value);
	if (detectedFormat === "custom") {
		return { added: importCustomToBox(value, box), warnings: [] };
	} else if (detectedFormat === "csv" || detectedFormat === "tsv") {
		return importCsvTsvToBox(value, detectedFormat, box, t);
	} else {
		return { added: 0, warnings: [] };
	}
}

function importCustomToBox(value: string, box: PokemonBox): number {
	const lines = value.split(/\n/g);
	let added = 0;
	for (const line of lines) {
		if (!box.canAdd) {
			break;
		}
		const data = box.deserializeItem(line);
		if (data === null) {
			continue;
		}
		box.add(data.iv, data.nickname);
		added++;
	}
	return added;
}

function importCsvTsvToBox(
	value: string,
	format: "csv" | "tsv",
	box: PokemonBox,
	t: TFunction,
): { added: number; warnings: ImportWarning[] } {
	const { items, warnings } = importFromCsvTsv(value, format, t);
	let added = 0;
	for (const item of items) {
		if (!box.canAdd) {
			break;
		}
		box.add(item.iv, item.nickname);
		added++;
	}
	return { added, warnings };
}

export default BoxImportDialog;
