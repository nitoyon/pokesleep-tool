import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

/**
 * Icon for Neutralizing Mint.
 */
const MintIcon = React.memo((props: SvgIconProps) => {
	return (
		<SvgIcon {...props} viewBox="0 0 24 24">
			{/* stem */}
			<path
				d="M12 22 C12 18 12 15 12 11"
				fill="none"
				stroke="#3a9a5b"
				strokeWidth="1.6"
				strokeLinecap="round"
			/>
			{/* left leaf */}
			<path
				d="M11.5 14 C6 15 2.5 11 3 6 C8 5.5 12 8.5 11.5 14 Z"
				fill="#ffffff"
				stroke="#3a9a5b"
				strokeWidth="1.4"
				strokeLinejoin="round"
			/>
			<path
				d="M11 13 C9 11 7 9 4.5 7"
				fill="none"
				stroke="#3a9a5b"
				strokeWidth="0.9"
				strokeLinecap="round"
			/>
			{/* right leaf */}
			<path
				d="M12.5 11 C12 5.5 15.5 2 21 2.5 C21.5 8 18 11.5 12.5 11 Z"
				fill="#ffffff"
				stroke="#3a9a5b"
				strokeWidth="1.4"
				strokeLinejoin="round"
			/>
			<path
				d="M13 10.5 C15 8 17 6 19.5 4"
				fill="none"
				stroke="#3a9a5b"
				strokeWidth="0.9"
				strokeLinecap="round"
			/>
		</SvgIcon>
	);
});

export default MintIcon;
