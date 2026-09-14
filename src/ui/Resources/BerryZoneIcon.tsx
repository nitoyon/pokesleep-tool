import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

const BerryZoneIcon = React.memo((props: SvgIconProps) => {
	return (
		<SvgIcon {...props} viewBox="0 0 24 24">
			<path
				fill="#ffaa99"
				d="M22,13.5 C22,16.81 17.52,19.5 12,19.5 C6.48,19.5 2,16.81 2,13.5
					C2,10.19 6.48,7.5 12,7.5 C17.52,7.5 22,10.19 22,13.5 Z"
			/>
			<path
				fill="none"
				stroke="#ffffff"
				strokeWidth="2.2"
				d="M18.4,13 C18.4,14.77 15.54,16.2 12,16.2 C8.46,16.2 5.6,14.77 5.6,13
					C5.6,11.23 8.46,9.8 12,9.8 C15.54,9.8 18.4,11.23 18.4,13 Z"
			/>
		</SvgIcon>
	);
});

export default BerryZoneIcon;
