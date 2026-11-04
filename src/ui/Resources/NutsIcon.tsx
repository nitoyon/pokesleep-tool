import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

const NutsIcon = React.memo((props: SvgIconProps) => {
	return (
		<SvgIcon {...props} viewBox="0 0 200 200">
			<NutsIconPaths />
		</SvgIcon>
	);
});

const peanutOutline =
	"M-4,100C-4,72.4,18.4,50,46,50C70,50,86,72,110,72C130,72,146,60,168,60C190,60,208,78,208,100C208,122,190,140,168,140C146,140,130,128,110,128C86,128,70,150,46,150C18.4,150,-4,127.6,-4,100Z";

export const NutsIconPaths = () => (
	<g transform="rotate(-50 100 100)">
		<path d={peanutOutline} fill="#ecc78c" strokeWidth="0" />
		<path
			d="M208,100C208,122,190,140,168,140C146,140,130,128,110,128C86,128,70,150,46,150C18.4,150,-4,127.6,-4,100C6,120,26,134,46,134C70,134,88,118,110,118C130,118,146,126,168,126C186,126,200,116,208,100Z"
			fill="#cf9f5f"
			strokeWidth="0"
		/>
		<path
			d="M0,82C14,76,30,75,46,75C70,75,88,86,110,86C130,86,146,80,168,80C184,80,196,82,204,84M-2,100C40,97,70,103,110,100C140,98,170,102,206,100M0,118C14,124,30,125,46,125C70,125,88,114,110,114C130,114,146,120,168,120C184,120,196,118,204,116"
			fill="none"
			stroke="#af804d"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="4"
		/>
		<path
			d="M16,60Q4,100,16,140M46,50Q50,100,46,150M78,61Q86,100,78,139M110,72Q116,100,110,128M138,66Q146,100,138,134M170,60Q176,100,170,140M196,72Q206,100,196,128"
			fill="none"
			stroke="#af804d"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="4"
		/>
		<path
			d={peanutOutline}
			fill="none"
			stroke="#333"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="7"
		/>
	</g>
);

export default NutsIcon;
