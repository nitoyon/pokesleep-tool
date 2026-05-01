import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	MenuItem,
	Switch,
} from "@mui/material";
import { styled } from "@mui/system";
import type i18next from "i18next";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import {
	getIngredientDrawIngredients,
	getLunarBlessingBerryCount,
	getMaxSkillLevel,
	getSkillRandomRange,
	getSkillSubValue,
	getSkillValue,
	type MainSkillName,
} from "../../../util/MainSkill";
import type PokemonIv from "../../../util/PokemonIv";
import SelectEx from "../../common/SelectEx";
import IngredientIcon from "../IngredientIcon";
import AreaBonusControl from "../Strength/AreaBonusControl";
import {
	StyledNatureDownEffect,
	StyledNatureUpEffect,
} from "./NatureTextField";

interface SkillDetailDialogConfig {
	species: number;
	energyNature: number;
	areaBonus: number;
	latiTwins: boolean;
}

interface SkillLevelDetailContent {
	desc: React.ReactNode;
	detail: React.ReactNode;
	column1: string;
	column2: string | undefined;
}

const SkillDetailDialog = React.memo(
	({
		value,
		open,
		onClose,
	}: {
		value: PokemonIv;
		open: boolean;
		onClose: () => void;
	}) => {
		const { t } = useTranslation();
		const [config, setConfig] = React.useState<SkillDetailDialogConfig>({
			species: 1,
			energyNature: 0,
			areaBonus: 0,
			latiTwins: false,
		});
		if (!open) {
			return null;
		}

		const skill = value.pokemon.skill;
		const content = getSkillContent(value, t);
		return (
			<StyledSkillDetailDialog open={open} onClose={onClose}>
				<DialogTitle>
					{t(`skills.${skill}.name`)}
					{skill === "Versatile" &&
						` (${t(`skills.${value.versatileSkill.replace(" (Random)", "")}.name`)})`}
				</DialogTitle>
				<DialogContent>
					<header>{content.desc}</header>
					<footer>{content.detail}</footer>
					<SkillTable value={value} content={content} config={config} />
					<ConfigForm
						value={value}
						config={config}
						onConfigChange={setConfig}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose} autoFocus>
						{t("close")}
					</Button>
				</DialogActions>
			</StyledSkillDetailDialog>
		);
	},
);

const SkillTable = React.memo(
	({
		value,
		content,
		config,
	}: {
		value: PokemonIv;
		content: SkillLevelDetailContent;
		config: SkillDetailDialogConfig;
	}) => {
		const skill = value.versatileSkill;
		if (skill.startsWith("Berry Burst")) {
			return <BerryBurstTable value={value} />;
		} else if (skill === "Energy for Everyone S (Lunar Blessing)") {
			return <LunarBlessingTable value={value} config={config} />;
		} else {
			return <NormalTable value={value} content={content} config={config} />;
		}
	},
);

const NormalTable = React.memo(
	({
		value,
		content,
		config,
	}: {
		value: PokemonIv;
		content: SkillLevelDetailContent;
		config: SkillDetailDialogConfig;
	}) => {
		const { t } = useTranslation();
		if (
			value.pokemon.skill === "Metronome" ||
			value.pokemon.skill.startsWith("Skill Copy")
		) {
			return null;
		}

		const skill: MainSkillName = value.versatileSkill;
		const max = getMaxSkillLevel(skill);
		const colMax = getMaxSkillLevel(value.pokemon.skill);
		const hasColumn1 = skill !== "Metronome";
		const isVersatile = value.pokemon.skill === "Versatile";

		return (
			<table>
				<thead>
					<tr>
						<th>{t("skill level")}</th>
						{hasColumn1 && <th>{content.column1}</th>}
						{content.column2 !== undefined && <th>{content.column2}</th>}
						{isVersatile && <th>{t("candy")}</th>}
					</tr>
				</thead>
				<tbody>
					{[...Array(colMax)].map((_, i) => {
						const level = i + 1;
						const valueLevel = Math.min(level, max);
						const value1 = getSkillValueText(skill, valueLevel, config, t);
						const value2 =
							content.column2 === undefined ? null : (
								<td>{getSkillValue2Text(value, valueLevel, config, t)}</td>
							);
						return (
							<tr key={level}>
								<td>Lv.{level}</td>
								{hasColumn1 && <td>{value1}</td>}
								{value2}
								{isVersatile && <td>{getVersatileCandyCount(level, t)}</td>}
							</tr>
						);
					})}
				</tbody>
			</table>
		);
	},
);

const BerryBurstTable = React.memo(({ value }: { value: PokemonIv }) => {
	const { t } = useTranslation();
	const skill: MainSkillName = value.versatileSkill;
	const max = getMaxSkillLevel(skill);
	const colMax = getMaxSkillLevel(value.pokemon.skill);
	const isVersatile = value.pokemon.skill === "Versatile";

	return (
		<table>
			<thead>
				<tr>
					<th rowSpan={2}>{t("skill level")}</th>
					<th colSpan={3}>{t("berry")}</th>
					{isVersatile && <th rowSpan={2}>{t("candy")}</th>}
				</tr>
				<tr>
					<th>{t("total")}</th>
					<th>{t("own")}</th>
					<th>{t("teammates")}</th>
				</tr>
			</thead>
			<tbody>
				{[...Array(colMax)].map((_, i) => {
					const level = i + 1;
					const burstLevel = Math.min(level, max);
					const own = getSkillValue(skill, burstLevel);
					const team = getSkillSubValue(skill, burstLevel);
					const total = own + team * 4;
					return (
						<tr key={level}>
							<td>Lv.{level}</td>
							<td>{total}</td>
							<td>{own}</td>
							<td>{team}</td>
							{isVersatile && <td>{getVersatileCandyCount(level, t)}</td>}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
});

const LunarBlessingTable = React.memo(
	({
		value,
		config,
	}: {
		value: PokemonIv;
		config: SkillDetailDialogConfig;
	}) => {
		const { t } = useTranslation();
		const skill = value.pokemon.skill;

		return (
			<table>
				<thead>
					<tr>
						<th rowSpan={2}>{t("skill level")}</th>
						<th rowSpan={2}>{t("nature effect.Energy recovery")}</th>
						<th colSpan={3}>{t("berry")}</th>
					</tr>
					<tr>
						<th>{t("total")}</th>
						<th>{t("own")}</th>
						<th>{t("teammates")}</th>
					</tr>
				</thead>
				<tbody>
					{[...Array(getMaxSkillLevel(skill))].map((_, i) => {
						const level = i + 1;
						const recovery = multiplyEnergyFactor(
							getSkillValue(skill, level),
							config.energyNature,
						);
						const count = getLunarBlessingBerryCount(level, config.species);
						return (
							<tr key={level}>
								<td>Lv.{level}</td>
								<td>{recovery}</td>
								<td>{count.myBerryCount + 4 * count.othersBerryCount}</td>
								<td>{count.myBerryCount}</td>
								<td>{count.othersBerryCount}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		);
	},
);

function multiplyEnergyFactor(value: number, nature: number): number {
	if (nature === 1) {
		return Math.floor(value * 1.2);
	}
	if (nature === -1) {
		return Math.floor(value * 0.88);
	}
	return value;
}

function getSkillContent(
	value: PokemonIv,
	t: typeof i18next.t,
): SkillLevelDetailContent {
	const skill = value.pokemon.skill;

	// Versatile
	if (skill === "Versatile") {
		const s = value.versatileSkill;
		return {
			desc: t(`skills.${s}.desc`) + t("skills.Versatile.desc"),
			detail: [
				<p key="t">{t(`skills.${s}.detail`)}</p>,
				<p key="v">{t("skills.Versatile.detail")}</p>,
			],
			column1: getSkillUnit(s, t),
			column2: getSkillUnit2(s, t),
		};
	}

	const components = { ingredients: <></> };
	if (skill.startsWith("Ingredient Draw S")) {
		components.ingredients = (
			<span>
				{getIngredientDrawIngredients(value.pokemon).map((ing) => (
					<IngredientIcon key={ing} name={ing} />
				))}
			</span>
		);
	}

	return {
		desc: <Trans i18nKey={`skills.${skill}.desc`} components={components} />,
		detail: t(`skills.${skill}.detail`)
			.split("\n")
			.map((x) => <p key={x}>{x}</p>),
		column1: getSkillUnit(skill, t),
		column2: getSkillUnit2(skill, t),
	};
}

function getSkillUnit(skill: MainSkillName, t: typeof i18next.t): string {
	if (
		skill.startsWith("Ingredient Magnet S") ||
		skill.startsWith("Ingredient Draw S") ||
		skill.startsWith("Cooking Assist S")
	) {
		return t("ing count");
	}
	if (
		skill.startsWith("Charge Energy S") ||
		skill.startsWith("Energizing Cheer S")
	) {
		return t("nature effect.Energy recovery");
	}
	if (skill === "Charge Strength S" || skill.startsWith("Charge Strength M")) {
		return t("strength2");
	}
	if (
		skill === "Charge Strength S (Random)" ||
		skill === "Charge Strength S (Stockpile)"
	) {
		return t("expected value", { value: "" });
	}
	if (skill.startsWith("Charge Strength S")) {
		return t("expected value", { value: t("strength2") });
	}
	if (skill === "Dream Shard Magnet S") {
		return t("dream shard");
	}
	if (skill === "Dream Shard Magnet S (Random)") {
		return t("expected value", { value: "" });
	}
	if (skill.startsWith("Energy for Everyone S")) {
		return t("e4e per pokemon");
	}
	if (skill === "Extra Helpful S" || skill === "Helper Boost") {
		return t("help count");
	}
	if (skill.startsWith("Cooking Power-Up S")) {
		return t("pot size power up");
	}
	if (skill === "Tasty Chance S") {
		return t("tasty chance increase");
	}
	if (skill.startsWith("Berry Burst")) {
		return t("total");
	}
	return t("unknown");
}

function getSkillUnit2(
	skill: MainSkillName,
	t: typeof i18next.t,
): string | undefined {
	if (
		skill === "Charge Strength S (Random)" ||
		skill === "Charge Strength S (Stockpile)"
	) {
		return t("range value", { value: "" });
	}
	if (skill === "Dream Shard Magnet S (Random)") {
		return t("range value", { value: "" });
	}
	if (skill === "Ingredient Draw S (Super Luck)") {
		return t("dream shard");
	}
	if (skill === "Ingredient Magnet S (Plus)") {
		return t("additional ingredients");
	}
	if (skill === "Energizing Cheer S (Heal Pulse)") {
		return t("help count per pokemon");
	}
	if (skill === "Versatile") {
		return t("candy");
	}
	if (skill === "Cooking Power-Up S (Minus)") {
		return t("nature effect.Energy recovery");
	}
	if (skill === "Cooking Assist S (Bulk Up)") {
		return t("tasty chance increase");
	}
	return undefined;
}

function getSkillValueText(
	skill: MainSkillName,
	level: number,
	config: SkillDetailDialogConfig,
	t: typeof i18next.t,
): React.ReactNode {
	const n = getSkillValue(skill, level, config.species);
	if (
		skill.startsWith("Energy for Everyone S") ||
		skill.startsWith("Charge Energy S") ||
		skill.startsWith("Energizing Cheer S")
	) {
		return t("num", { n: multiplyEnergyFactor(n, config.energyNature) });
	}

	if (skill.startsWith("Charge Strength")) {
		return t("num", { n: Math.floor(n * (1 + config.areaBonus / 100)) });
	}

	const baseText = t("num", { n });
	return baseText;
}

function getSkillValue2Text(
	value: PokemonIv,
	level: number,
	config: SkillDetailDialogConfig,
	t: typeof i18next.t,
): React.ReactNode {
	const skill = value.versatileSkill;

	// Dream Shard Magnet S (Random)
	if (skill === "Dream Shard Magnet S (Random)") {
		const range = getSkillRandomRange(skill, level);
		return (
			<small>
				{t("num", { n: range[0] })}
				{t("range separator")}
				{t("num", { n: range[1] })}
			</small>
		);
	}

	// Range with area bonus
	if (
		skill === "Charge Strength S (Random)" ||
		skill === "Charge Strength S (Stockpile)"
	) {
		const range = getSkillRandomRange(skill, level);
		const b = 1 + config.areaBonus / 100;
		return (
			<small>
				{t("num", { n: Math.floor(range[0] * b) })}
				{t("range separator")}
				{t("num", { n: Math.floor(range[1] * b) })}
			</small>
		);
	}

	if (skill === "Ingredient Magnet S (Plus)") {
		return getSkillSubValue(skill, level, value.pokemon.ing1.name);
	}

	if (skill === "Ingredient Draw S (Super Luck)") {
		const shards = getSkillSubValue(skill, level);
		return `${t("num", { n: shards })} / ${t("num", { n: shards * 5 })}`;
	}

	if (skill === "Cooking Power-Up S (Minus)") {
		return multiplyEnergyFactor(
			getSkillSubValue(skill, level),
			config.energyNature,
		);
	}

	if (skill === "Cooking Assist S (Bulk Up)") {
		return getSkillSubValue(skill, level);
	}

	if (skill === "Energizing Cheer S (Heal Pulse)") {
		const base = getSkillSubValue(skill, level);
		const bonus = level <= 2 ? 1 : level <= 5 ? 2 : 3;
		return base + (config.latiTwins ? bonus : 0);
	}

	return null;
}

function getVersatileCandyCount(
	level: number,
	t: typeof i18next.t,
): React.ReactNode {
	const count = getSkillSubValue("Versatile", level);
	if (count === 0) {
		return "1";
	} else {
		return (
			<>
				1{" "}
				<small style={{ whiteSpace: "nowrap" }}>
					({t("sometimes")} {1 + count})
				</small>
			</>
		);
	}
}

const StyledSkillDetailDialog = styled(Dialog)({
	"& > div.MuiDialog-container > div.MuiPaper-root": {
		// extend dialog width
		width: "100%",
		margin: "20px",
	},

	"& .MuiDialogTitle-root": {
		fontSize: "1rem",
		fontWeight: "bold",
		padding: "0.8rem 1rem",
	},
	"& .MuiDialogContent-root": {
		padding: "0 1rem",
		"& > header": {
			marginBottom: "0.2rem",
			fontSize: "0.9rem",
			"& > span > svg": {
				width: "1rem",
				height: "1rem",
				paddingRight: "0.2rem",
			},
		},
		"& > footer": {
			marginBottom: "0.5rem",
			fontSize: "0.8rem",
			"& > p": {
				margin: 0,
			},
		},
		"& > table": {
			borderCollapse: "separate",
			borderSpacing: "2px",
			"& > thead": {
				background: "#557799",
				fontSize: "0.9rem",
				"& > tr > th": {
					color: "#fff",
					padding: "0.1rem 0.4rem",
					fontWeight: "normal",
					textAlign: "center",
				},
				"& > tr:first-of-type > th": {
					"&:first-of-type": {
						borderTopLeftRadius: "0.5rem",
					},
					"&:last-of-type": {
						borderTopRightRadius: "0.5rem",
					},
				},
			},
			"& > tbody": {
				background: "#f3f3f3",
				fontSize: "0.9rem",
				"& > tr:nth-of-type(even)": {
					background: "#e8e8f3",
				},
				"& > tr > td": {
					padding: "0.1rem 0.4rem",
					fontWeight: "normal",
					textAlign: "right",
					"&:nth-of-type(1)": {
						textAlign: "center",
					},
				},
				"& > tr:last-of-type > td:first-of-type": {
					borderBottomLeftRadius: "0.5rem",
				},
				"& > tr:last-of-type > td:last-of-type": {
					borderBottomRightRadius: "0.5rem",
				},
			},
		},
		"& > div.config": {
			background: "#f0f0f0",
			padding: "0.5rem",
			borderRadius: "0.9rem",
			fontSize: "0.9rem",
			margin: "0 .5rem",
			"& > section": {
				display: "flex",
				flex: "0 auto",
				marginTop: "0.5rem",
				"&:first-of-type": {
					marginTop: 0,
				},
				"& > span.lbl": {
					marginRight: "auto",
					marginTop: 0,
				},
				"& > div": {
					display: "flex",
					alignItems: "center",
				},
			},
		},
	},
});

const ConfigForm = React.memo(
	({
		value,
		config,
		onConfigChange,
	}: {
		value: PokemonIv;
		config: SkillDetailDialogConfig;
		onConfigChange: (config: SkillDetailDialogConfig) => void;
	}) => {
		const { t } = useTranslation();

		const onEnergyChange = React.useCallback(
			(val: string) => {
				onConfigChange({ ...config, energyNature: parseInt(val, 10) });
			},
			[onConfigChange, config],
		);
		const onSpeciesChange = React.useCallback(
			(val: string) => {
				onConfigChange({ ...config, species: parseInt(val, 10) });
			},
			[onConfigChange, config],
		);
		const onLatiTwinsChange = React.useCallback(
			(e: React.ChangeEvent<HTMLInputElement>) => {
				onConfigChange({ ...config, latiTwins: e.target.checked });
			},
			[onConfigChange, config],
		);

		const skill = value.versatileSkill;

		if (skill.startsWith("Charge Strength")) {
			return (
				<StyledConfigForm>
					<section>
						<span className="lbl">{t("area bonus")}:</span>
						<AreaBonusControl
							value={config.areaBonus}
							onChange={(val) => {
								onConfigChange({ ...config, areaBonus: val });
							}}
						/>
					</section>
				</StyledConfigForm>
			);
		}

		// Energy nature
		let energyNatureSection: React.ReactNode = null;
		if (
			skill.startsWith("Energy for Everyone S") ||
			skill.startsWith("Charge Energy S") ||
			skill.startsWith("Energizing Cheer S") ||
			skill === "Cooking Power-Up S (Minus)"
		) {
			energyNatureSection = (
				<section>
					<span className="lbl">{t("nature")}:</span>
					<SelectEx
						onChange={onEnergyChange}
						value={config.energyNature.toString()}
					>
						<MenuItem value="1">
							<StyledNatureUpEffect>
								{t("nature effect.Energy recovery")}
							</StyledNatureUpEffect>
						</MenuItem>
						<MenuItem value="0">
							{t("nature effect.Energy recovery")} ーー
						</MenuItem>
						<MenuItem value="-1">
							<StyledNatureDownEffect>
								{t("nature effect.Energy recovery")}
							</StyledNatureDownEffect>
						</MenuItem>
					</SelectEx>
				</section>
			);
		}

		let speciesSection: React.ReactNode = null;
		if (
			skill === "Energy for Everyone S (Lunar Blessing)" ||
			skill === "Helper Boost"
		) {
			speciesSection = (
				<section>
					<span className="lbl">{t("different species")}:</span>
					<SelectEx
						value={config.species}
						onChange={onSpeciesChange}
						sx={{ padding: "0 8px" }}
					>
						<MenuItem value={1}>1</MenuItem>
						<MenuItem value={2}>2</MenuItem>
						<MenuItem value={3}>3</MenuItem>
						<MenuItem value={4}>4</MenuItem>
						<MenuItem value={5}>5</MenuItem>
					</SelectEx>
				</section>
			);
		}

		if (skill === "Helper Boost") {
			return <StyledConfigForm>{speciesSection}</StyledConfigForm>;
		}

		if (skill === "Energy for Everyone S (Lunar Blessing)") {
			return (
				<StyledConfigForm>
					{energyNatureSection}
					{speciesSection}
				</StyledConfigForm>
			);
		}

		if (skill === "Energizing Cheer S (Heal Pulse)") {
			return (
				<StyledConfigForm>
					{energyNatureSection}
					<section>
						<span>
							{t("pokemon on your team", {
								pokemon: t("pokemons.Latios"),
							})}
							:
						</span>
						<Switch checked={config.latiTwins} onChange={onLatiTwinsChange} />
					</section>
				</StyledConfigForm>
			);
		}

		if (energyNatureSection !== null) {
			return <StyledConfigForm>{energyNatureSection}</StyledConfigForm>;
		}

		return null;
	},
);

const StyledConfigForm = styled("div")({
	marginTop: "0.5rem",
	"& > section": {
		display: "flex",
		flex: "0 auto",
		paddingTop: "0.5rem",
		"& > span:first-of-type": {
			fontSize: "0.9rem",
			marginRight: "auto",
			marginTop: 0,
		},
		"& > div": {
			display: "flex",
			alignItems: "center",
		},
	},
});

export default SkillDetailDialog;
