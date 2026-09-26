import { Button, Dialog, DialogActions } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { maxLevel } from "../../../util/PokemonRp";
import MarkdownBlockElement from "../../common/MarkdownBlockElement";

const RpInfoDialog = React.memo(
	({
		isError,
		level,
		fieldIndex,
		open,
		onClose,
	}: {
		isError: boolean;
		level: number;
		fieldIndex: number;
		open: boolean;
		onClose: () => void;
	}) => {
		const { t } = useTranslation();
		if (!open) {
			return null;
		}
		if (isError) {
			return (
				<StyledRpInfoDialog open={open} onClose={onClose}>
					<article>
						{fieldIndex >= 0 && (
							<p>
								{t("rp tab warning field", { field: t(`area.${fieldIndex}`) })}
							</p>
						)}
						{level > 0 && <p>{t("rp tab warning level", { level })}</p>}
						<p>
							{t("go to strength tab to show the current condition values")}
						</p>
					</article>
					<DialogActions>
						<Button onClick={onClose}>{t("close")}</Button>
					</DialogActions>
				</StyledRpInfoDialog>
			);
		}

		return (
			<StyledRpInfoDialog open={open} onClose={onClose}>
				<article>
					<h2>{t("rp")}</h2>
					<p>
						<Trans
							i18nKey="rp formula"
							components={{
								link: (
									<a href={t("rp formula doc url")}>
										{t("rp formula doc title")}
									</a>
								),
							}}
						/>
					</p>
					<p>{t("estimated beyond level", { level: maxLevel })}</p>

					<h2>{t("strength, ingredients, skill count")}</h2>
					<MarkdownBlockElement text={t("rp tab condition list")} />
				</article>
				<DialogActions>
					<Button onClick={onClose}>{t("close")}</Button>
				</DialogActions>
			</StyledRpInfoDialog>
		);
	},
);

const StyledRpInfoDialog = styled(Dialog)({
	"& article": {
		margin: "1rem 1rem 0 1rem",
		"& > h2": {
			fontSize: "1rem",
			margin: "0.8rem 0 0 0",
			lineHeight: 1.2,
			"&:first-of-type": {
				margin: 0,
			},
		},
		"& > p": {
			fontSize: "0.8rem",
			margin: "0.3rem 0",
		},
		"& > ul": {
			margin: "0.5rem 0",
			padding: "0 0 0 1.5rem",
			"& > li": {
				margin: "0.2rem 0",
				fontSize: "0.8rem",
			},
		},
	},
});

export default RpInfoDialog;
