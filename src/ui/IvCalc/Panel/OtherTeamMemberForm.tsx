import React from "react";
import { useTranslation } from "react-i18next";
import type { PokemonBoxItem } from "../../../util/PokemonBox";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import TextLikeButton from "../../common/TextLikeButton";
import MessageDialog from "../../Dialog/MessageDialog";
import BoxIvSelectDialog from "../Box/BoxIvSelectDialog";
import InfoButton from "../InfoButton";
import type { IvAction } from "../IvState";
import PokemonIcon from "../PokemonIcon";

const OtherTeamMemberForm = React.memo(
	({
		parameter,
		dispatch,
		items,
	}: {
		parameter: StrengthParameter;
		dispatch: (action: IvAction) => void;
		items: PokemonBoxItem[];
	}) => {
		const { t } = useTranslation();
		const [open, setOpen] = React.useState(false);
		const [infoOpen, setInfoOpen] = React.useState(false);

		const onInfoClick = React.useCallback(() => {
			setInfoOpen(true);
		}, []);
		const onInfoClose = React.useCallback(() => {
			setInfoOpen(false);
		}, []);

		const onClick = React.useCallback(() => {
			setOpen(true);
		}, []);
		const onClose = React.useCallback(() => {
			setOpen(false);
		}, []);

		const onSelect = React.useCallback(
			(box: PokemonBoxItem) => {
				dispatch({
					type: "changeParameter",
					payload: {
						parameter: {
							...parameter,
							teamMember: box.iv,
						},
					},
				});
				setOpen(false);
			},
			[dispatch, parameter],
		);

		return (
			<section>
				<span className="lbl">
					{t("other team member")}:<InfoButton onClick={onInfoClick} />
				</span>

				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
					}}
				>
					<PokemonIcon
						idForm={parameter.teamMember.idForm}
						size={18}
						radius={4}
						shiny={parameter.teamMember.shiny}
					/>
					<TextLikeButton onClick={onClick}>
						{t(`pokemons.${parameter.teamMember.pokemonName}`)}
						<small> (Lv.{parameter.teamMember.level})</small>
					</TextLikeButton>
					<BoxIvSelectDialog
						items={items}
						iv={parameter.teamMember}
						parameter={parameter}
						open={open}
						dispatch={dispatch}
						onClose={onClose}
						onSelect={onSelect}
					/>
					<MessageDialog
						open={infoOpen}
						onClose={onInfoClose}
						message={
							<>
								<p>{t("other team member info1")}</p>
								<p>{t("other team member info2")}</p>
							</>
						}
					/>
				</div>
			</section>
		);
	},
);

export default OtherTeamMemberForm;
