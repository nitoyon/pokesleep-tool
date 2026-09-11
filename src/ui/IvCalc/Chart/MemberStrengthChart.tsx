import { Popper } from "@mui/material";
import { styled } from "@mui/system";
import {
	animated,
	type SpringValue,
	useSpring,
	useTransition,
} from "@react-spring/web";
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

		// Keep each result's original team-slot index (not the post-filter
		// position) so a row's key — and thus its animation spring — stays
		// tied to a specific team slot even when an earlier slot is
		// toggled off/on and the visible rows compact.
		const rows = React.useMemo(
			() =>
				results
					.map((r, slot) => (r === undefined ? null : { slot, result: r }))
					.filter(
						(r): r is { slot: number; result: MemberStrengthChartResult } =>
							r !== null,
					),
			[results],
		);

		const { max: maxTotal, step: axisStep } = React.useMemo(() => {
			const max = rows.reduce(
				(m, r) =>
					Math.max(
						m,
						r.result.berryTotalStrength +
							r.result.ingStrength +
							r.result.skillStrength,
					),
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
							{rows.map(({ slot, result }, i) => (
								<MemberStrengthRow
									key={slot}
									y={i * ROW_HEIGHT}
									result={result}
									chartWidth={chartWidth}
									maxValue={maxTotal}
									highlighted={hoverIndex === i}
								/>
							))}
						</g>
						{hoverIndex !== -1 && mouse !== null && (
							<MemberStrengthHover
								mouse={mouse}
								result={rows[hoverIndex].result}
							/>
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
		const tickCount = step === 0 ? 0 : Math.round(maxValue / step);
		const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * step);

		// Remember the scale that was in effect before this render so a
		// newly-appearing tick can slide in from the position it would have
		// occupied under the old scale, instead of just fading in place.
		const prevScaleRef = React.useRef({ maxValue, width });
		const prevScale = prevScaleRef.current;
		React.useEffect(() => {
			prevScaleRef.current = { maxValue, width };
		}, [maxValue, width]);

		const transitions = useTransition<number, { x: number; opacity: number }>(
			ticks,
			{
				keys: (v) => v,
				from: (v) => ({
					x: xScale(v, prevScale.maxValue, prevScale.width),
					opacity: 0,
				}),
				enter: (v) => ({ x: xScale(v, maxValue, width), opacity: 1 }),
				update: (v) => ({ x: xScale(v, maxValue, width), opacity: 1 }),
				leave: (v) => ({ x: xScale(v, maxValue, width), opacity: 0 }),
				config: { tension: 400, friction: 40 },
			},
		);

		return (
			<>
				{transitions((style, v) => (
					<AxisGridLine style={style} value={v} height={height} />
				))}
			</>
		);
	},
);

/** Position `v` would occupy on an axis of the given scale/width. */
function xScale(v: number, maxValue: number, width: number): number {
	return maxValue === 0 ? 0 : (v / maxValue) * width;
}

/** A single axis gridline + label that slides to its target x as it moves,
 * appears, or disappears. */
const AxisGridLine = React.memo(
	({
		style,
		value,
		height,
	}: {
		style: {
			x: SpringValue<number>;
			opacity: SpringValue<number>;
		};
		value: number;
		height: number;
	}) => {
		const { x, opacity } = style;

		return (
			<animated.g
				style={{ opacity }}
				transform={x.to((x) => `translate(${x}, 0)`)}
			>
				<line x1={0} y1="0" x2={0} y2={height} stroke="#ddd" />
				<text
					alignmentBaseline="hanging"
					x={0}
					y={height + 3}
					fontSize="60%"
					fill="#999"
					textAnchor="middle"
				>
					{formatWithComma(value)}
				</text>
			</animated.g>
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

		const targetBerryWidth = xScale(result.berryTotalStrength);
		const targetIngWidth = xScale(result.ingStrength);
		const targetSkillWidth = xScale(result.skillStrength);

		const { berryWidth, ingX, ingWidth, skillX, skillWidth } = useSpring({
			berryWidth: targetBerryWidth,
			ingX: targetBerryWidth,
			ingWidth: targetIngWidth,
			skillX: targetBerryWidth + targetIngWidth,
			skillWidth: targetSkillWidth,
			config: { tension: 400, friction: 40 },
		});

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
				<animated.rect
					x={0}
					y={barY}
					width={berryWidth}
					height={BAR_HEIGHT}
					fill={BERRY_COLOR}
					opacity={0.85}
				/>
				<animated.rect
					x={ingX}
					y={barY}
					width={ingWidth}
					height={BAR_HEIGHT}
					fill={ING_COLOR}
					opacity={0.85}
				/>
				<animated.rect
					x={skillX}
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
