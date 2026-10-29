import { MenuItem, MenuList, ToggleButton } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { toxtricityId } from "../../../data/pokemons";
import Nature, { type NatureEffect } from "../../../util/Nature";
import type PokemonIv from "../../../util/PokemonIv";
import PopperMenu from "../../common/PopperMenu";
import TextLikeButton from "../../common/TextLikeButton";
import MintIcon from "../../Resources/MintIcon";

const NatureTextField = React.memo(
	({ iv, onChange }: { iv: PokemonIv; onChange: (value: Nature) => void }) => {
		const value = iv.nature;
		const [open, setOpen] = React.useState(false);
		const anchorRef = React.useRef<HTMLButtonElement>(null);

		const onClick = React.useCallback(() => {
			setOpen((prevOpen) => !prevOpen);
		}, []);

		const onClose = React.useCallback(() => {
			setOpen(false);
		}, []);

		// return focus to the button when we transitioned from !open -> open
		const prevOpen = React.useRef(open);
		React.useEffect(() => {
			if (prevOpen.current === true && open === false) {
				anchorRef.current?.focus();
			}
			prevOpen.current = open;
		}, [open]);

		return (
			<>
				<TextLikeButton
					ref={anchorRef}
					onClick={onClick}
					className={open ? "focused" : ""}
				>
					<NatureElement value={value} />
				</TextLikeButton>
				<NatureEditPopper
					iv={iv}
					open={open}
					anchorRef={anchorRef}
					onClose={onClose}
					onChange={onChange}
				/>
			</>
		);
	},
);

const NatureEditPopper = React.memo(
	({
		iv,
		open,
		anchorRef,
		onClose,
		onChange,
	}: {
		iv: PokemonIv;
		open: boolean;
		anchorRef: React.RefObject<HTMLButtonElement | null>;
		onClose: () => void;
		onChange: (value: Nature) => void;
	}) => {
		const { t } = useTranslation();
		const [step, setStep] = React.useState<1 | 2>(1);
		const [upEffect, setUpEffect] = React.useState<NatureEffect | null>(null);
		// Toggle state of the mint button.
		// Kept separately from iv.nature so that it can be turned on
		// even for neutral natures (applied when a non-neutral nature is chosen).
		const [mintSelected, setMintSelected] = React.useState(iv.nature.mint);
		// biome-ignore lint/correctness/useExhaustiveDependencies: sync only when the menu opens
		React.useEffect(() => {
			if (open) {
				setMintSelected(iv.nature.mint);
			}
		}, [open]);

		const allNatures = React.useMemo(
			() =>
				Nature.allNatures.filter(
					(x) =>
						iv.pokemon.id !== toxtricityId ||
						(iv.pokemon.form === "Amped" && x.isAmped) ||
						(iv.pokemon.form === "Low Key" && x.isLowKey),
				),
			[iv.pokemon.id, iv.pokemon.form],
		);

		const onUpEffectChange = React.useCallback(
			(event: React.MouseEvent<HTMLElement>) => {
				const val = event.currentTarget.getAttribute("value") as NatureEffect;

				// If there is only one nature with the selected upEffect,
				// select it and close the menu. (Toxtricity only)
				const candidates = allNatures.filter((x) => x.upEffect === val);
				if (candidates.length === 1) {
					// Apply the mint toggle (ignored for neutral natures)
					onChange(new Nature(candidates[0].name, mintSelected));
					onClose();
					return;
				}

				setUpEffect(val);
				setStep(2);
			},
			[allNatures, mintSelected, onChange, onClose],
		);

		const onNatureClick = React.useCallback(
			(event: React.MouseEvent<HTMLElement>) => {
				const name = event.currentTarget.getAttribute("value");
				if (name !== null) {
					// Apply the mint toggle (ignored for neutral natures)
					onChange(new Nature(name, mintSelected));
					onClose();
				}
			},
			[mintSelected, onChange, onClose],
		);

		const onMintChange = React.useCallback(() => {
			const newValue = !mintSelected;
			setMintSelected(newValue);
			onChange(iv.nature.withMint(newValue));
		}, [iv.nature, mintSelected, onChange]);

		const sortNatureByLocalName = React.useCallback(
			(natures: Nature[]) =>
				natures
					.map((x) => ({ nature: x, key: t(`natures.${x.name}`) }))
					.sort((a, b) => (a.key > b.key ? 1 : -1))
					.map((x) => x.nature),
			[t],
		);

		let menuItems: React.ReactNode[] = [];
		const upEffects: NatureEffect[] = [
			"No effect",
			"Speed of help",
			"Main skill chance",
			"Ingredient finding",
			"EXP gains",
			"Energy recovery",
		];
		if (step === 1) {
			for (const upEffect of upEffects) {
				const natureElms = sortNatureByLocalName(
					allNatures.filter((x) => x.upEffect === upEffect),
				).map((x) => <span key={x.name}>{t(`natures.${x.name}`)}</span>);
				const upElm =
					upEffect === "No effect" ? (
						t("nature effect.No effect")
					) : (
						<StyledNatureUpEffect>
							{t(`nature effect.${upEffect}`)}
						</StyledNatureUpEffect>
					);
				menuItems.push(
					<StyledUpEffectMenuItem
						key={upEffect}
						value={upEffect}
						onClick={onUpEffectChange}
					>
						<div>
							<div className="up">{upElm}</div>
							<div className="natures">{natureElms}</div>
						</div>
					</StyledUpEffectMenuItem>,
				);
			}
		}
		if (step === 2) {
			const natures = sortNatureByLocalName(
				allNatures.filter((x) => x.upEffect === upEffect),
			);
			menuItems = natures.map((x) => (
				<MenuItem key={x.name} value={x.name} onClick={onNatureClick}>
					<NatureElement value={x} />
				</MenuItem>
			));
		}

		React.useEffect(() => {
			if (!open) {
				setStep(1);
			}
		}, [open]);

		return (
			<PopperMenu open={open} onClose={onClose} anchorEl={anchorRef.current}>
				<div>
					{step === 1 && (
						<StyledMenuHeader>
							<StyledMintToggleButton
								value="mint"
								size="small"
								selected={mintSelected}
								onChange={onMintChange}
								title={t("neutralizing mint")}
								aria-label={t("neutralizing mint")}
							>
								<MintIcon />
							</StyledMintToggleButton>
						</StyledMenuHeader>
					)}
					<MenuList>{menuItems}</MenuList>
				</div>
			</PopperMenu>
		);
	},
);

const StyledNatureElement = styled("div")({
	display: "grid",
	gridTemplateColumns: "8rem 1fr",
	gridGap: ".3rem",
	"& > span": {
		border: "2px solid #24d76a",
		borderRadius: "1rem",
		textAlign: "center",
		padding: ".2rem 0",
		margin: ".5rem 1rem .5rem 0",
		position: "relative",
		"& > svg.mint": {
			position: "absolute",
			top: "-7px",
			right: "4px",
			fontSize: "0.9rem",
		},
	},
	"& > div": {
		margin: "auto 0",
		fontSize: ".8rem",
		"& > span": {
			display: "block",
		},
	},
});

export const StyledNatureUpEffect = styled("span")({
	"&::after": {
		content: '" ▲▲"',
		color: "#ff6666",
	},
});
export const StyledNatureDownEffect = styled("span")({
	"&::after": {
		content: '" ▼▼"',
		color: "#6666ff",
	},
});
const StyledUpEffectMenuItem = styled(MenuItem)({
	"& > div": {
		"& > div.up": {
			fontSize: "1rem",
			lineHeight: 1.3,
		},
		"& > div.natures": {
			fontSize: ".6rem",
			lineHeight: 1.5,
			"& >span": {
				paddingRight: ".8rem",
				color: "#888",
				fontSize: ".6rem",
			},
		},
	},
});

const StyledMenuHeader = styled("div")({
	display: "flex",
	justifyContent: "flex-end",
	padding: "6px 6px 0 6px",
});

const StyledMintToggleButton = styled(ToggleButton)({
	padding: "3px",
	"& > svg": {
		fontSize: "1.1rem",
	},
	"&:not(.Mui-selected) > svg": {
		filter: "grayscale(1)",
		opacity: 0.6,
	},
});

const NatureElement = React.memo(({ value }: { value: Nature }) => {
	const { t } = useTranslation();

	const natureName = (
		<span>
			{t(`natures.${value.name}`)}
			{value.mint && (
				<MintIcon className="mint" aria-label={t("neutralizing mint")} />
			)}
		</span>
	);
	if (value.upEffect === "No effect") {
		return (
			<StyledNatureElement>
				{natureName}
				<div>{t("nature effect.No effect")}</div>
			</StyledNatureElement>
		);
	} else {
		return (
			<StyledNatureElement>
				{natureName}
				<div>
					<StyledNatureUpEffect>
						{t(`nature effect.${value.upEffect}`)}
					</StyledNatureUpEffect>
					<StyledNatureDownEffect>
						{t(`nature effect.${value.downEffect}`)}
					</StyledNatureDownEffect>
				</div>
			</StyledNatureElement>
		);
	}
});

export default NatureTextField;
