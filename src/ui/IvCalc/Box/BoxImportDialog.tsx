import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Snackbar,
	TextField,
} from "@mui/material";
import type { TFunction } from "i18next";
import React from "react";
import { useTranslation } from "react-i18next";
import {
	detectFormat,
	importFromCsvTsv,
} from "../../../util/Formatter/BoxImporter";
import type PokemonBox from "../../../util/PokemonBox";

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
		const [importedMessage, setImportedMessage] = React.useState("");
		const { t } = useTranslation();

		const onValueChange = React.useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				setValue(e.target.value);
			},
			[],
		);

		const onClose_ = React.useCallback(() => {
			setValue("");
			onClose();
		}, [onClose]);

		const onImportClick = React.useCallback(() => {
			const added = importToBox(value, box, t);
			if (added === 0) {
				setImportedMessage(t("failed to import"));
			} else {
				box.save();
				setImportedMessage(t("imported N pokemon", { n: added }));
				onClose_();
			}
		}, [box, t, onClose_, value]);

		const onImportedMessageClose = React.useCallback(() => {
			setImportedMessage("");
		}, []);

		const importedMessageVisible = importedMessage !== "";

		return (
			<>
				<Dialog open={open} onClose={onClose_}>
					<DialogTitle>{t("import")}</DialogTitle>
					<DialogContent>
						<p style={{ fontSize: "0.9rem", margin: "0 0 1rem 0" }}>
							{t("import message")}
						</p>
						<TextField
							label={t("box data")}
							multiline
							fullWidth
							rows={6}
							value={value}
							onChange={onValueChange}
							slotProps={{ htmlInput: { wrap: "off" } }}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={onImportClick}>{t("import")}</Button>
						<Button onClick={onClose_}>{t("close")}</Button>
					</DialogActions>
				</Dialog>
				<Snackbar
					open={importedMessageVisible}
					autoHideDuration={2000}
					onClose={onImportedMessageClose}
					message={importedMessage}
				/>
			</>
		);
	},
);

function importToBox(value: string, box: PokemonBox, t: TFunction): number {
	const detectedFormat = detectFormat(value);
	if (detectedFormat === "custom") {
		return importCustomToBox(value, box);
	} else if (detectedFormat === "csv" || detectedFormat === "tsv") {
		return importCsvTsvToBox(value, detectedFormat, box, t);
	} else {
		return 0;
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
): number {
	const items = importFromCsvTsv(value, format, t);
	let added = 0;
	for (const item of items) {
		if (!box.canAdd) {
			break;
		}
		box.add(item.iv, item.nickname);
		added++;
	}
	return added;
}

export default BoxImportDialog;
