import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import Faq from "../../data/faq";
import MarkdownBlockElement from "../common/MarkdownBlockElement";

interface FaqDialogProps {
	open: boolean;
	onClose: () => void;
}

const FaqDialog = React.memo(({ open, onClose }: FaqDialogProps) => {
	const { t } = useTranslation();

	if (!open) {
		return null;
	}

	const entries = Faq.getEntries("IvCalc");

	return (
		<StyledFaqDialog open={open} onClose={onClose}>
			<DialogTitle>
				<QuizOutlinedIcon sx={{ verticalAlign: "middle", mr: 0.5 }} />
				{t("faq")}
			</DialogTitle>
			<DialogContent dividers>
				{entries.map((entry) => (
					<Accordion key={entry.id}>
						<AccordionSummary
							expandIcon={<ExpandMoreIcon htmlColor="#00dd00" />}
						>
							{t(`IvCalc.faq.${entry.id}.question`)}
						</AccordionSummary>
						<AccordionDetails>
							<MarkdownBlockElement text={t(`IvCalc.faq.${entry.id}.answer`)} />
						</AccordionDetails>
					</Accordion>
				))}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>{t("close")}</Button>
			</DialogActions>
		</StyledFaqDialog>
	);
});

const StyledFaqDialog = styled(Dialog)({
	"& .MuiDialogContent-root": {
		padding: "0.5rem",
		background: "#f3f3f3",
		"& .MuiAccordion-root": {
			margin: "0.5rem 0",
			borderRadius: "6px",
			overflow: "hidden",
			"&:before": {
				display: "none",
			},
			"&.Mui-expanded": {
				margin: "0.5rem 0",
			},
			"& .MuiAccordionSummary-root": {
				padding: "2px 10px",
			},
		},
		"& .MuiAccordionSummary-content": {
			fontSize: "0.8rem",
			padding: 0,
			margin: 0,
		},
		"& .MuiAccordionDetails-root": {
			padding: "0 0.5rem 0.5rem",
			color: "#333",
			"& > p": {
				margin: "0.4rem 0 0 0",
				fontSize: "0.8rem",
			},
			"& > ul, & > ol": {
				margin: "0.5rem 0",
				padding: "0 0 0 1.2rem",
				fontSize: "0.8rem",
			},
		},
	},
});

export default FaqDialog;
