import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { ButtonBase, TextField, ToggleButton } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { PokemonBoxItem } from "../../../util/Box/PokemonBox";
import type PokemonIv from "../../../util/PokemonIv";
import PokemonRp from "../../../util/PokemonRp";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import IvForm from "../IvForm/IvForm";
import type { IvAction } from "../IvState";
import TypeSpecialtyPanel from "../Panel/TypeSpecialtyPanel";
import PokemonIcon from "../PokemonIcon";
import RpLabel from "../Rp/RpLabel";

/**
 * Form to edit a pokemon in the box (IV, nickname and shiny).
 *
 * The item is kept by the parent. `onChange` is called
 * with the edited item on every change.
 */
const BoxItemEditor = React.memo(
	({
		boxItem,
		isEdit,
		parameter,
		showSummary,
		dispatch,
		onChange,
	}: {
		boxItem: PokemonBoxItem;
		isEdit: boolean;
		parameter: StrengthParameter;
		showSummary: boolean;
		dispatch: (action: IvAction) => void;
		onChange: (value: PokemonBoxItem) => void;
	}) => {
		const { t } = useTranslation();
		const { iv, nickname } = boxItem;
		const rp = React.useMemo(() => new PokemonRp(iv).calculate().rp, [iv]);
		const localName = t(`pokemons.${iv.pokemonName}`);

		const notify = React.useCallback(
			(newIv: PokemonIv, newNickname: string) => {
				const name =
					newNickname === t(`pokemons.${newIv.pokemonName}`) ? "" : newNickname;
				onChange(
					new PokemonBoxItem(newIv, name, boxItem.attributes, boxItem.id),
				);
			},
			[onChange, boxItem.attributes, boxItem.id, t],
		);

		const onFormChange = React.useCallback(
			(value: PokemonIv) => {
				notify(value, nickname);
			},
			[nickname, notify],
		);
		const onShinyClick = React.useCallback(() => {
			onFormChange(iv.clone({ shiny: !iv.shiny }));
		}, [iv, onFormChange]);
		const displayNickName = nickname === "" ? localName : nickname;
		const onNickNameBlur = React.useCallback(
			(event: React.FocusEvent<HTMLInputElement>) => {
				if (event.target.value !== displayNickName) {
					notify(iv, event.target.value);
				}
			},
			[displayNickName, iv, notify],
		);

		return (
			<StyledBoxItemEditor>
				<BoxItemSummary boxItem={boxItem} rp={rp} visible={showSummary} />
				<RpLabel rp={rp} iv={iv} />
				<header className="control">
					<TypeSpecialtyPanel
						type={iv.pokemon.type}
						specialty={iv.pokemon.specialty}
						level={iv.level}
						parameter={parameter}
						dispatch={dispatch}
					/>
					{!iv.isMythical && (
						<span className="shiny">
							<ToggleButton
								value="shiny"
								selected={iv.shiny}
								onClick={onShinyClick}
							>
								<AutoAwesomeIcon />
							</ToggleButton>
						</span>
					)}
				</header>
				<div className="icon">
					<ButtonBase onClick={onShinyClick}>
						<PokemonIcon idForm={iv.idForm} shiny={iv.shiny} size={80} />
					</ButtonBase>
				</div>
				<div className="nickname">
					<TextField
						// Recreate the field to reflect the nickname changed outside
						key={`${boxItem.id}-${displayNickName}`}
						variant="standard"
						size="small"
						defaultValue={displayNickName}
						onBlur={onNickNameBlur}
					/>
				</div>
				<IvForm
					parameter={parameter}
					pokemonIv={iv}
					fixMode={isEdit}
					dispatch={dispatch}
					onChange={onFormChange}
				/>
			</StyledBoxItemEditor>
		);
	},
);

const StyledBoxItemEditor = styled("article")({
	position: "relative",
	padding: ".5rem .5rem 4rem .5rem",

	"& > header.control": {
		position: "absolute",
		top: ".8rem",
		right: "1rem",
		"& > span.shiny": {
			"& > button": {
				border: 0,
				borderRadius: "1rem",
				margin: 0,
				padding: "4px",
				background: "#cccccc",
				color: "#ffffff",
				marginLeft: ".2rem",
				"& > svg": {
					width: 14,
					height: 14,
				},
				"&.Mui-selected": {
					background: "#ffcc00",
					color: "#ffffff",
				},
			},
		},
	},
	"& > div.icon": {
		margin: ".5rem auto .2rem",
		width: "82px",
		"& > button": {
			borderRadius: ".5rem",
		},
	},
	"& > div.nickname": {
		margin: "0 auto 1.2rem auto",
		width: "10rem",
		"& input": {
			fontSize: "1.2rem",
			fontWeight: "bold",
			textAlign: "center",
		},
	},
});

/**
 * Summary of the item (SP, level and nickname) that sticks to the top
 * left of the drawer content while the content is scrolled down.
 *
 * It is placed in each item so that it moves with the item on swipe.
 * The height is 0 so that it doesn't affect the layout of the item.
 */
const BoxItemSummary = React.memo(
	({
		boxItem,
		rp,
		visible,
	}: {
		boxItem: PokemonBoxItem;
		rp: number;
		visible: boolean;
	}) => {
		const { t } = useTranslation();
		const { iv } = boxItem;

		return (
			<StyledBoxItemSummary
				className={visible ? "visible" : ""}
				aria-hidden={!visible}
			>
				<div className="card">
					<PokemonIcon idForm={iv.idForm} shiny={iv.shiny} size={32} />
					<div className="info">
						<span
							style={{
								color: "#fd775d",
								fontWeight: "bold",
								paddingRight: ".4rem",
								fontSize: ".7rem",
								display: "inline-block",
								transform: "scale(1, 0.9)",
							}}
						>
							{t("rp")}
						</span>
						<span
							style={{
								fontSize: "1rem",
								fontWeight: "bold",
								display: "inline-block",
								transform: "scale(1, 0.9)",
							}}
						>
							{t("num", { n: rp })}
						</span>

						<div className="lvName">
							<span className="lv">Lv.</span>
							<span className="lvValue">{iv.level}</span>
							<span className="name">{boxItem.filledNickname(t)}</span>
						</div>
					</div>
				</div>
			</StyledBoxItemSummary>
		);
	},
);

const StyledBoxItemSummary = styled("div")({
	position: "sticky",
	top: 0,
	zIndex: 2,
	height: 0,
	margin: "-.5rem 0 .5rem -.5rem",
	pointerEvents: "none",
	opacity: 0,
	transition: "opacity 150ms ease-out",
	"&.visible": {
		opacity: 1,
	},
	"& > div.card": {
		maxWidth: "calc(100% - 3rem)",
		width: "fit-content",
		display: "flex",
		alignItems: "center",
		gap: ".4rem",
		padding: ".4rem .8rem .4rem .5rem",
		background: "#ffffff",
		border: "1px solid #fd775d",
		borderLeft: "6px solid #fd775d",
		borderRadius: "0 .6rem .6rem 0",
		boxShadow: "0 1px 4px rgba(0, 0, 0, 0.25)",
	},
	"& div.info": {
		minWidth: 0,
		marginLeft: ".5rem",
		"& > div.lvName": {
			whiteSpace: "nowrap",
			overflow: "hidden",
			textOverflow: "ellipsis",
			lineHeight: 1,
		},
		// Stretch horizontally in the same way as RpLabel
		"& > div.lvName > span": {
			display: "inline-block",
		},
		"& span.lv": {
			color: "#4caf50",
			fontSize: ".6rem",
			fontWeight: "bold",
			transform: "scale(1, 0.9)",
			paddingRight: ".1rem",
		},
		"& span.lvValue": {
			color: "#4caf50",
			fontSize: ".7rem",
			transform: "scale(1, 0.9)",
			fontWeight: "bold",
			paddingRight: ".8rem",
		},
		"& span.name": {
			fontSize: ".8rem",
			fontWeight: "bold",
		},
	},
});

export default BoxItemEditor;
