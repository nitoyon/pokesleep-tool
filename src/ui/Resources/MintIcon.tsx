import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

/**
 * Icon for Neutralizing Mint.
 */
const MintIcon = React.memo((props: SvgIconProps) => {
	return (
		<SvgIcon {...props} viewBox="0 0 24 24">
			{/* outlines */}
			<g fill="none" stroke="#3a9a5b" strokeWidth={2.8} strokeLinejoin="round">
				<path d={stemPath} />
				<path {...topLeaf} />
				<path {...leftLeaf} />
				<path {...rightLeaf} />
			</g>
			{/* fills */}
			<path d={stemPath} fill="#a5d65a" />
			<g fill="#ffffff">
				<path {...topLeaf} />
				<path {...leftLeaf} />
				<path {...rightLeaf} />
			</g>
		</SvgIcon>
	);
});

const leafPath = "M0 0 C-5.5 0 -5.5 -6.93 0 -12.6 C5.5 -6.93 5.5 0 0 0 Z";
const stemPath = "M10.8 14 L10.8 20.3 A1.2 1.2 0 0 0 13.2 20.3 L13.2 14";
const topLeaf = { d: leafPath, transform: "translate(12 14.2)" };
const leftLeaf = {
	d: leafPath,
	transform: "translate(12.5 15.5) rotate(-65)",
};
const rightLeaf = {
	d: leafPath,
	transform: "translate(11 15.5) rotate(70)",
};

export default MintIcon;
