import { styled } from "@mui/system";
import React from "react";

const NoneArticle = React.memo(() => {
	return <StyledNoneArticle>ー</StyledNoneArticle>;
});

const StyledNoneArticle = styled("article")({
	display: "flex",
	fontWeight: 600,
	justifyContent: "center",
	alignItems: "center",
	fontSize: "1.1rem",
	height: "3rem",
});

export default NoneArticle;
