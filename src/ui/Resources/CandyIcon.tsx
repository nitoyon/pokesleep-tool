import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

const CandyIcon = React.memo(({ sx, ...props }: SvgIconProps) => {
	return (
		<SvgIcon {...props} sx={{ color: "#e7ba67", ...sx }} viewBox="0 0 75 75">
			<g
				strokeLinejoin="round"
				strokeWidth="4"
				stroke="currentColor"
				fill="currentColor"
				transform="rotate(-45, 45, 45)"
			>
				<polygon points="30,30 10,15 10,45" />
				<circle cx="45" cy="30" r="18" />
				<polygon points="60,30 80,15 80,45" />
			</g>
		</SvgIcon>
	);
});

export default CandyIcon;
