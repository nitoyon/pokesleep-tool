import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import type { PokemonSpecialty, PokemonType } from "../../../data/pokemons";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import MessageDialog from "../../Dialog/MessageDialog";
import TypeInfoDialog from "../Dialog/TypeInfoDialog";
import type { IvAction } from "../IvState";
import SpecialtyButton from "../SpecialtyButton";
import TypeButton from "../TypeButton";

const TypeSpecialtyPanel = React.memo(
	({
		type,
		specialty,
		level,
		parameter,
		dispatch,
	}: {
		type: PokemonType;
		specialty: PokemonSpecialty;
		level: number;
		parameter: StrengthParameter;
		dispatch: (action: IvAction) => void;
	}) => {
		const { t } = useTranslation();
		const [typeOpen, setTypeOpen] = React.useState(false);
		const [specialtyOpen, setSpecialtyOpen] = React.useState(false);

		const onTypeClick = React.useCallback(() => {
			setTypeOpen(true);
		}, []);
		const onTypeClose = React.useCallback(() => {
			setTypeOpen(false);
		}, []);
		const onSpecialtyClick = React.useCallback(() => {
			setSpecialtyOpen(true);
		}, []);
		const onSpecialtyClose = React.useCallback(() => {
			setSpecialtyOpen(false);
		}, []);

		return (
			<>
				<StyledSpan className="status">
					<TypeButton type={type} disabled onClick={onTypeClick} />
					<SpecialtyButton specialty={specialty} onClick={onSpecialtyClick} />
				</StyledSpan>
				<TypeInfoDialog
					open={typeOpen}
					onClose={onTypeClose}
					type={type}
					level={level}
					dispatch={dispatch}
					parameter={parameter}
				/>
				<MessageDialog
					open={specialtyOpen}
					onClose={onSpecialtyClose}
					message={
						<>
							<header>
								{t("specialty")}
								<>: </>
								<SpecialtyButton specialty={specialty} disabled />
							</header>
							<p>
								{t(`${specialty.toLowerCase()} desc`)}
								{specialty === "All" && (
									<ul>
										<li>{t("berries desc")}</li>
										<li>{t("ingredients desc")}</li>
										<li>{t("skills desc")}</li>
									</ul>
								)}
							</p>
						</>
					}
				/>
			</>
		);
	},
);

const StyledSpan = styled("span")({
	"& > button": {
		padding: 0,
		lineHeight: 1.5,
		fontSize: "0.7rem",
		borderRadius: "0.5rem",
		width: "4rem",
	},
});

export default TypeSpecialtyPanel;
