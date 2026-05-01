import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { IconButton } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";

const StyledIconButton = styled(IconButton)({
	"&": {
		padding: 0,
		marginLeft: "6px",
		"& > svg": {
			width: "20px",
			height: "20px",
			color: "#bbb",
			"&.error": {
				color: "#ed6c02",
				animation: "redglow 0.6s ease-out infinite normal",
			},
		},
	},
	"@keyframes redglow": {
		"0%": { transform: "scale(0.9)" },
		"100%": { transform: "scale(1.1)" },
	},
});

const InfoButton = React.memo(
	({ isError, onClick }: { isError?: boolean; onClick: () => void }) => {
		return (
			<StyledIconButton onClick={onClick}>
				{!isError && <InfoOutlinedIcon />}
				{isError && <WarningRoundedIcon className="error" />}
			</StyledIconButton>
		);
	},
);

export default InfoButton;
