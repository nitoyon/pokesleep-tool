import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import {
	Button,
	ButtonBase,
	Dialog,
	DialogActions,
	TextField,
	ToggleButton,
} from "@mui/material";
import Slide from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { PokemonBoxItem } from "../../../util/PokemonBox";
import PokemonIv from "../../../util/PokemonIv";
import PokemonRp from "../../../util/PokemonRp";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import MessageDialog from "../../Dialog/MessageDialog";
import IvForm from "../IvForm/IvForm";
import type { IvAction } from "../IvState";
import PokemonIcon from "../PokemonIcon";
import RpLabel from "../Rp/RpLabel";
import SpecialtyButton from "../SpecialtyButton";
import TypeButton from "../TypeButton";

// Full-screen transition
// https://mui.com/material-ui/react-dialog/#full-screen-dialogs
const Transition = React.forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement;
	},
	ref: React.Ref<unknown>,
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

const BoxItemDialog = React.memo(
	({
		open,
		boxItem,
		isEdit,
		parameter,
		dispatch,
		onClose,
		onChange,
	}: {
		open: boolean;
		boxItem: PokemonBoxItem | null;
		isEdit: boolean;
		parameter: StrengthParameter;
		dispatch: (action: IvAction) => void;
		onClose: () => void;
		onChange: (value: PokemonBoxItem) => void;
	}) => {
		if (!isEdit) {
			boxItem = new PokemonBoxItem(
				new PokemonIv({ pokemonName: "Venusaur" }),
				undefined,
				-1,
			);
		}
		if (boxItem === null) {
			return null;
		}
		return (
			<StyledDialog
				open={open}
				onClose={onClose}
				fullScreen
				slots={{ transition: Transition }}
			>
				<BoxItemDialogContent
					originalBoxItem={boxItem}
					isEdit={isEdit}
					parameter={parameter}
					dispatch={dispatch}
					onClose={onClose}
					onChange={onChange}
				/>
			</StyledDialog>
		);
	},
);

const BoxItemDialogContent = React.memo(
	({
		originalBoxItem,
		isEdit,
		parameter,
		dispatch,
		onClose,
		onChange,
	}: {
		originalBoxItem: PokemonBoxItem;
		isEdit: boolean;
		parameter: StrengthParameter;
		dispatch: (action: IvAction) => void;
		onChange: (value: PokemonBoxItem) => void;
		onClose: () => void;
	}) => {
		const { t } = useTranslation();
		const [boxItem, setBoxItem] =
			React.useState<PokemonBoxItem>(originalBoxItem);
		const [nickname, setNickname] = React.useState<string>(
			originalBoxItem.nickname,
		);
		const [specialtyOpen, setSpecialtyOpen] = React.useState(false);
		const [rp, setRp] = React.useState<number>(
			new PokemonRp(boxItem.iv).calculate().rp,
		);
		const [isEditingNickName, setIsEditingNickName] = React.useState(false);
		const localName = t(`pokemons.${boxItem.iv.pokemonName}`);

		const onFormChange = React.useCallback(
			(value: PokemonIv) => {
				setBoxItem(new PokemonBoxItem(value, boxItem.nickname, boxItem.id));
				setRp(new PokemonRp(value).calculate().rp);
				if (nickname === localName) {
					setNickname("");
				}
			},
			[boxItem, localName, nickname],
		);
		const onShinyClick = React.useCallback(() => {
			onFormChange(
				boxItem.iv.clone({
					shiny: !boxItem.iv.shiny,
				}),
			);
		}, [boxItem, onFormChange]);
		const onNickNameChange = React.useCallback(
			(event: React.ChangeEvent<HTMLInputElement>) => {
				setNickname(event.target.value);
			},
			[],
		);
		const onNickNameFocus = React.useCallback(() => {
			setIsEditingNickName(true);
			if (nickname === "") {
				setNickname(localName);
			}
		}, [nickname, localName]);
		const onNickNameBlur = React.useCallback(() => {
			setIsEditingNickName(false);
			if (nickname === localName) {
				setNickname("");
			}
		}, [nickname, localName]);

		const onCloseClick = React.useCallback(() => {
			if (isEdit) {
				onChange(new PokemonBoxItem(boxItem.iv, nickname, boxItem.id));
			}
			onClose();
		}, [isEdit, onChange, onClose, boxItem, nickname]);
		const onSaveClick = React.useCallback(() => {
			if (!isEdit) {
				onChange(new PokemonBoxItem(boxItem.iv, nickname, boxItem.id));
			}
			onClose();
		}, [isEdit, onChange, onClose, boxItem, nickname]);

		const onSpecialtyClick = React.useCallback(() => {
			setSpecialtyOpen(true);
		}, []);
		const onSpecialtyClose = React.useCallback(() => {
			setSpecialtyOpen(false);
		}, []);

		let displayNickName = nickname;
		if (!isEditingNickName && nickname === "") {
			displayNickName = t(`pokemons.${boxItem.iv.pokemonName}`);
		}

		return (
			<>
				<article>
					<RpLabel rp={rp} iv={boxItem.iv} />
					<header className="control">
						<span className="status">
							<TypeButton
								type={boxItem.iv.pokemon.type}
								disabled
								onClick={() => {}}
							/>
							<SpecialtyButton
								specialty={boxItem.iv.pokemon.specialty}
								onClick={onSpecialtyClick}
							/>
						</span>
						{!boxItem.iv.isMythical && (
							<span className="shiny">
								<ToggleButton
									value="shiny"
									selected={boxItem.iv.shiny}
									onClick={onShinyClick}
								>
									<AutoAwesomeIcon />
								</ToggleButton>
							</span>
						)}
					</header>
					<div className="icon">
						<ButtonBase onClick={onShinyClick}>
							<PokemonIcon
								idForm={boxItem.iv.idForm}
								shiny={boxItem.iv.shiny}
								size={80}
							/>
						</ButtonBase>
					</div>
					<div className="nickname">
						<TextField
							variant="standard"
							size="small"
							value={displayNickName}
							onChange={onNickNameChange}
							onFocus={onNickNameFocus}
							onBlur={onNickNameBlur}
						/>
					</div>
					<IvForm
						parameter={parameter}
						pokemonIv={boxItem.iv}
						fixMode={isEdit}
						dispatch={dispatch}
						onChange={onFormChange}
					/>
				</article>
				<DialogActions>
					<Button onClick={onCloseClick}>{t("close")}</Button>
					{!isEdit && <Button onClick={onSaveClick}>{t("add")}</Button>}
				</DialogActions>
				<MessageDialog
					open={specialtyOpen}
					onClose={onSpecialtyClose}
					message={
						<>
							<header>
								{t("specialty")}
								<>: </>
								<SpecialtyButton
									specialty={boxItem.iv.pokemon.specialty}
									disabled
								/>
							</header>
							<p>
								{t(`${boxItem.iv.pokemon.specialty.toLowerCase()} desc`)}
								{boxItem.iv.pokemon.specialty === "All" && (
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

const StyledDialog = styled(Dialog)({
	"& div.MuiDialog-paper": {
		"& > article": {
			padding: ".5rem .5rem 4rem .5rem",

			"& > header.control": {
				position: "absolute",
				top: ".8rem",
				right: ".7rem",
				"& > span.status > button": {
					padding: 0,
					lineHeight: 1.5,
					fontSize: "0.7rem",
					borderRadius: "0.5rem",
				},
				"& > span.shiny": {
					"& > button": {
						border: 0,
						borderRadius: "1rem",
						margin: 0,
						padding: "4px",
						background: "#cccccc",
						color: "#ffffff",
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
		},
		"& > div.MuiDialogActions-root": {
			position: "fixed",
			padding: "0 0.5rem 1rem 0.5rem",
			margin: 0,
			background: "rgba(255, 255, 255, 0.8)",
			width: "calc(100% - 1rem)",
			bottom: 0,
		},
	},
});

export default BoxItemDialog;
