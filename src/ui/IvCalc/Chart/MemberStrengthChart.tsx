import { Popper } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { useTranslation } from "react-i18next";
import { formatWithComma } from "../../../util/NumberUtil";
import type PokemonIv from "../../../util/PokemonIv";
import { createIconElements } from "../PokemonIcon";
import { type MousePosition, useSvgTouch } from "./ChartHook";

/** Minimal per-member result required by MemberStrengthChart. */
export interface MemberStrengthChartResult {
	iv: PokemonIv;
	berryTotalStrength: number;
	ingStrength: number;
	skillStrength: number;
}

const BERRY_COLOR = "#24d76a";
const ING_COLOR = "#fab855";
const SKILL_COLOR = "#44a2fd";

const ROW_HEIGHT = 32;
const BAR_HEIGHT = 18;
const ICON_SIZE = 22;
const ICON_RADIUS = 4;
const LEFT_MARGIN = 30;
const TOP_MARGIN = 8;
const BOTTOM_MARGIN = 16;
const RIGHT_MARGIN = 6;

export const MemberStrengthChart = React.memo(
	({
		width,
		results,
	}: {
		width: number;
		results: (MemberStrengthChartResult | undefined)[];
	}) => {
		const svgRef = React.useRef<SVGSVGElement | null>(null);
		const mouse = useSvgTouch(svgRef);

		const rows = React.useMemo(
			() =>
				results.filter((r): r is MemberStrengthChartResult => r !== undefined),
			[results],
		);

		const { max: maxTotal, step: axisStep } = React.useMemo(() => {
			const max = rows.reduce(
				(m, r) =>
					Math.max(m, r.berryTotalStrength + r.ingStrength + r.skillStrength),
				0,
			);
			return computeAxisScale(max);
		}, [rows]);

		const hasData = rows.length > 0 && width > 0;
		const chartWidth = Math.max(0, width - LEFT_MARGIN - RIGHT_MARGIN);
		const chartHeight = rows.length * ROW_HEIGHT;
		const height = TOP_MARGIN + chartHeight + BOTTOM_MARGIN;

		let hoverIndex = -1;
		if (mouse !== null && hasData) {
			const margin = 20;
			if (
				mouse.svgY - TOP_MARGIN >= -margin &&
				mouse.svgY - TOP_MARGIN < chartHeight + margin &&
				mouse.svgX - LEFT_MARGIN >= -margin &&
				mouse.svgX - LEFT_MARGIN < chartWidth + margin
			) {
				const index = Math.floor((mouse.svgY - TOP_MARGIN) / ROW_HEIGHT);
				if (index >= 0 && index < rows.length) {
					hoverIndex = index;
				}
			}
		}

		// Always mount the <svg> (even before data arrives) so the ref used
		// by useSvgTouch's mouse/touch listeners attaches on first render
		return (
			<svg
				ref={svgRef}
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				aria-hidden={true}
			>
				{hasData && (
					<>
						<g transform={`translate(${LEFT_MARGIN}, ${TOP_MARGIN})`}>
							<MemberStrengthAxis
								width={chartWidth}
								height={chartHeight}
								maxValue={maxTotal}
								step={axisStep}
							/>
							{rows.map((r, i) => (
								<MemberStrengthRow
									// biome-ignore lint/suspicious/noArrayIndexKey: rows never reordered
									key={i}
									y={i * ROW_HEIGHT}
									result={r}
									chartWidth={chartWidth}
									maxValue={maxTotal}
									highlighted={hoverIndex === i}
								/>
							))}
						</g>
						{hoverIndex !== -1 && mouse !== null && (
							<MemberStrengthHover mouse={mouse} result={rows[hoverIndex]} />
						)}
					</>
				)}
			</svg>
		);
	},
);

const MemberStrengthAxis = React.memo(
	({
		width,
		height,
		maxValue,
		step,
	}: {
		width: number;
		height: number;
		maxValue: number;
		step: number;
	}) => {
		const xScale = (v: number) => (maxValue === 0 ? 0 : (v / maxValue) * width);
		const tickCount = step === 0 ? 0 : Math.round(maxValue / step);
		const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * step);

		return (
			<>
				<g stroke="#ddd">
					{ticks.map((v) => (
						<line key={v} x1={xScale(v)} y1="0" x2={xScale(v)} y2={height} />
					))}
				</g>
				<g fontSize="60%" fill="#999" textAnchor="middle">
					{ticks.map((v) => (
						<text
							key={v}
							alignmentBaseline="hanging"
							x={xScale(v)}
							y={height + 3}
						>
							{formatWithComma(v)}
						</text>
					))}
				</g>
			</>
		);
	},
);

const MemberStrengthRow = React.memo(
	({
		y,
		result,
		chartWidth,
		maxValue,
		highlighted,
	}: {
		y: number;
		result: MemberStrengthChartResult;
		chartWidth: number;
		maxValue: number;
		highlighted: boolean;
	}) => {
		const xScale = (v: number) =>
			maxValue === 0 ? 0 : (v / maxValue) * chartWidth;
		const barY = y + (ROW_HEIGHT - BAR_HEIGHT) / 2;

		const berryWidth = xScale(result.berryTotalStrength);
		const ingWidth = xScale(result.ingStrength);
		const skillWidth = xScale(result.skillStrength);

		return (
			<g>
				{highlighted && (
					<rect
						x={-LEFT_MARGIN}
						y={y}
						width={chartWidth + LEFT_MARGIN + RIGHT_MARGIN}
						height={ROW_HEIGHT}
						fill="#000"
						opacity={0.05}
					/>
				)}
				<PokemonIconMark
					x={-LEFT_MARGIN}
					y={y + (ROW_HEIGHT - ICON_SIZE) / 2}
					idForm={result.iv.idForm}
					shiny={result.iv.shiny}
				/>
				<rect
					x={0}
					y={barY}
					width={berryWidth}
					height={BAR_HEIGHT}
					fill={BERRY_COLOR}
					opacity={0.85}
				/>
				<rect
					x={berryWidth}
					y={barY}
					width={ingWidth}
					height={BAR_HEIGHT}
					fill={ING_COLOR}
					opacity={0.85}
				/>
				<rect
					x={berryWidth + ingWidth}
					y={barY}
					width={skillWidth}
					height={BAR_HEIGHT}
					fill={SKILL_COLOR}
					opacity={0.85}
				/>
			</g>
		);
	},
);

/** Renders a Pokemon icon (rounded, bordered) directly as SVG, embedding
 * the icon's own rects rather than nesting a foreignObject/<img>. */
const PokemonIconMark = React.memo(
	({
		x,
		y,
		idForm,
		shiny,
	}: {
		x: number;
		y: number;
		idForm: number;
		shiny: boolean;
	}) => {
		const clipId = React.useId();
		const elements = React.useMemo(
			() => createIconElements(idForm, shiny, ICON_SIZE),
			[idForm, shiny],
		);

		return (
			<g transform={`translate(${x}, ${y})`}>
				<defs>
					<clipPath id={clipId}>
						<rect
							width={ICON_SIZE}
							height={ICON_SIZE}
							rx={ICON_RADIUS}
							ry={ICON_RADIUS}
						/>
					</clipPath>
				</defs>
				<g clipPath={`url(#${clipId})`}>{elements}</g>
				<rect
					width={ICON_SIZE}
					height={ICON_SIZE}
					rx={ICON_RADIUS}
					ry={ICON_RADIUS}
					fill="none"
					stroke="#999"
				/>
			</g>
		);
	},
);

const MemberStrengthHover = React.memo(
	({
		mouse,
		result,
	}: {
		mouse: MousePosition;
		result: MemberStrengthChartResult;
	}) => {
		const { t } = useTranslation();
		const total =
			result.berryTotalStrength + result.ingStrength + result.skillStrength;

		const anchorEl = {
			getBoundingClientRect: () => {
				return new DOMRect(
					mouse.x - window.scrollX,
					mouse.y - window.scrollY,
					0,
					0,
				);
			},
		};

		return (
			<StyledPopper
				open={true}
				anchorEl={anchorEl}
				placement="right-end"
				modifiers={[{ name: "offset", options: { offset: [0, 12] } }]}
			>
				<div>
					<dl>
						<dt>{t("berry")}:</dt>
						<dd>{formatWithComma(result.berryTotalStrength)}</dd>
						<dt>{t("ingredient")}:</dt>
						<dd>{formatWithComma(result.ingStrength)}</dd>
						<dt>{t("skill")}:</dt>
						<dd>{formatWithComma(result.skillStrength)}</dd>
						<dt>{t("total")}:</dt>
						<dd>{formatWithComma(total)}</dd>
					</dl>
				</div>
			</StyledPopper>
		);
	},
);

const StyledPopper = styled(Popper)({
	pointerEvents: "none",
	zIndex: 2147483647,
	"& > div": {
		padding: "0.4rem 0.6rem",
		background: "rgba(246, 246, 246, 0.9)",
		borderRadius: "0.8rem",
		boxShadow: "4px 2px 5px 3px rgba(128, 128, 128, 0.2)",
		"& > dl": {
			margin: 0,
			fontSize: "0.75rem",
			display: "grid",
			gridTemplateColumns: "auto auto",
			"& > dt": {
				margin: "0 0.4rem 0 0",
				color: "#333",
			},
			"& > dd": {
				margin: 0,
				textAlign: "right",
			},
		},
	},
});

/**
 * Picks a chart-axis scale for `value`
 */
function computeAxisScale(
	value: number,
	targetTicks = 4,
): { max: number; step: number } {
	if (value <= 0) {
		return { max: 1, step: 1 };
	}
	const rawStep = value / targetTicks;
	const exp = Math.floor(Math.log10(rawStep));
	const pow10 = 10 ** exp;
	const candidates = [0.5 * pow10, pow10, 2.5 * pow10, 5 * pow10, 10 * pow10];

	let lower = candidates[0];
	let upper = candidates[candidates.length - 1];
	for (const c of candidates) {
		if (c <= rawStep) {
			lower = c;
		}
		if (c >= rawStep) {
			upper = c;
			break;
		}
	}

	const evaluate = (step: number) => {
		const max = Math.ceil(value / step) * step;
		return { step, max, count: Math.round(max / step) };
	};
	const a = evaluate(lower);
	const b = evaluate(upper);
	const da = Math.abs(a.count - targetTicks);
	const db = Math.abs(b.count - targetTicks);
	const chosen = da !== db ? (da < db ? a : b) : a.max <= b.max ? a : b;
	return { max: chosen.max, step: chosen.step };
}

export default MemberStrengthChart;
