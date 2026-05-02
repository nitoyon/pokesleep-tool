import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { styled } from "@mui/system";
import React from "react";

const BerryArticle = React.memo(({ strength }: { strength: string }) => {
	return (
		<StyledBerryArticle>
			<div>
				<LocalFireDepartmentIcon sx={{ color: "#ff944b" }} />
				<span>{strength}</span>
			</div>
		</StyledBerryArticle>
	);
});

const StyledBerryArticle = styled("article")({
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	flexDirection: "column",
	fontWeight: 600,
	verticalAlign: "middle",
	fontSize: "1.1rem",
	height: "3rem",
	"& > div": {
		"& > span": {
			verticalAlign: "middle",
		},
		"& > svg": {
			verticalAlign: "middle",
		},
	},
});

export default BerryArticle;
