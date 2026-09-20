import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";
import React from "react";

/** Pink berry shaped like a magatama (comma-shaped bead) with a yellow tail. */
const MagoBerry = React.memo((props: SvgIconProps) => {
	return (
		<SvgIcon {...props} viewBox="0 0 200 200">
			<MagoBerryPaths />
		</SvgIcon>
	);
});

const BODY_PATH =
	"M18,74C18,56,30,46,44,46C58,46,66,56,66,70C66,82,76,88,86,84C94,80,98,58,124,52C152,46,182,68,182,108C182,146,156,172,116,172C74,172,18,150,18,74Z";

export const MagoBerryPaths = () => (
	<>
		<path d={BODY_PATH} fill="#f9a3c3" strokeWidth="0" />
		<path
			d="M164,154.3C152.5,165.5,136,172,116,172C92.9,172,65.6,165.3,45.6,146.7C92,158,138,160,164,154.3Z"
			fill="#ee82aa"
			strokeWidth="0"
		/>
		<path
			d="M70,81.1C67.5,78.5,66,74.7,66,70C66,56,58,46,44,46C30,46,18,56,18,74C18,123.5,41.8,150.1,70,162.7Z"
			fill="#fbf7aa"
			strokeWidth="0"
		/>
		<path
			d={BODY_PATH}
			fill="none"
			stroke="#8a4f3f"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="8"
		/>
	</>
);

export default MagoBerry;
