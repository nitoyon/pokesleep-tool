import React from "react";
import { useTranslation } from "react-i18next";
import type IvState from "./IvState";

const RateNotFixedPanel = React.memo(({ state }: { state: IvState }) => {
	const { t } = useTranslation();

	if (!state.pokemonIv.pokemon.rateNotFixed) {
		return null;
	}

	return (
		<div
			style={{
				border: "1px solid red",
				background: "#ffeeee",
				color: "red",
				fontSize: "0.9rem",
				borderRadius: "0.5rem",
				marginTop: "3px",
				padding: "0 0.3rem",
			}}
		>
			{t("rate is not fixed")}
		</div>
	);
});

export default RateNotFixedPanel;
