import { styled } from "@mui/system";
import React from "react";

const SpawnCountLabel = React.memo(({ count }: { count: number }) => {
	return (
		<StyledCount>
			<span className="ball">◓</span>
			<span className="multiply">×</span>
			<span className="value">{count}</span>
		</StyledCount>
	);
});

const StyledCount = styled("div")({
	"& > span.ball": {
		color: "#ff6347",
	},
	"& > span.multiply": {
		color: "#666",
	},
	"& > span.value": {
		color: "#e6a83a",
		fontSize: "1.16em",
	},
});

export default SpawnCountLabel;
