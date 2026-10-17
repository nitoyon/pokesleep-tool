import { styled } from "@mui/system";
import { type SpringValue, useSpringValue } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import React from "react";
import { clamp } from "../../util/NumberUtil";

/** Gap between each tab (in pixels) */
const gap = 20;

/** Drag bounds beyond the container (in pixels) */
const bound = 20;

/** Default selector for elements on which drag is not started (charts, sliders) */
export const defaultIgnoreDragSelector = "svg[width], span.MuiSlider-root";

/**
 * Base container that moves horizontally aligned tabs by drag gesture.
 *
 * This component handles the drag and the animation of the track
 * position `x`. How the tabs are placed by `x` is up to `children`
 * (see DraggableTabContainer).
 *
 * @param index The index of the tab shown in the viewport.
 * @param min The minimum index (-Infinity if unbounded).
 * @param max The maximum index (Infinity if unbounded).
 * @param width The width of each tab (in pixels).
 * @param onIndexChange Callback fired when the index is changed by drag.
 * @param ignoreDragSelector CSS selector of elements on which drag is not started.
 * @param style Style of the container.
 * @param children Render function that receives the track position `x` (in pixels)
 *                 and the width of each tab plus the gap.
 *                 The returned element should be `div.tabTrack`.
 */
const SwipeContainer = React.memo(
	({
		index,
		min,
		max,
		width,
		onIndexChange,
		ignoreDragSelector = defaultIgnoreDragSelector,
		style,
		children,
	}: {
		index: number;
		min: number;
		max: number;
		width: number;
		onIndexChange: (index: number) => void;
		ignoreDragSelector?: string;
		style?: React.CSSProperties;
		children: (x: SpringValue<number>, widthGap: number) => React.ReactNode;
	}) => {
		const isFirstTime = React.useRef(true);
		const ignoreDragRef = React.useRef(false);
		const widthGap = width + gap;

		const x = useSpringValue(-index * widthGap);

		const bind = useDrag(
			({ active, movement: [mx], velocity: [vx], first, event }) => {
				if (first) {
					ignoreDragRef.current =
						ignoreDragSelector !== "" &&
						event.target instanceof Element &&
						event.target.closest(ignoreDragSelector) !== null;
				}
				if (ignoreDragRef.current) {
					return;
				}

				if (active) {
					return x.start({
						to: -index * widthGap + mx,
						immediate: true,
					});
				}

				const changed = Math.abs(vx) > 0.2 || Math.abs(mx) > width / 2;
				let newIndex = index;
				if (changed) {
					newIndex += mx > 0 ? -1 : 1;
					newIndex = clamp(min, newIndex, max);
				}
				if (newIndex !== index) {
					onIndexChange(newIndex);
				}

				return x.start({
					to: -newIndex * widthGap,
					immediate: isFirstTime.current,
				});
			},
			{
				from: [-index * widthGap, 0],
				filterTaps: true,
				bounds: () => ({
					left: index === max ? -widthGap * max - bound : -Infinity,
					right: index === min ? -widthGap * min + bound : Infinity,
				}),
				rubberband: true,
			},
		);

		React.useEffect(() => {
			const targetX = -index * widthGap;
			if (isFirstTime.current) {
				x.set(targetX);

				// Set isFirstTime to false in the next frame
				// to avoid animation on the initial render
				requestAnimationFrame(() => {
					isFirstTime.current = false;
				});
			} else {
				x.start(targetX);
			}
		}, [index, widthGap, x]);

		return (
			<StyledSwipeContainer style={style} {...bind()}>
				{children(x, widthGap)}
			</StyledSwipeContainer>
		);
	},
);

const StyledSwipeContainer = styled("div")({
	overflow: "hidden",
	touchAction: "pan-y",
	overscrollBehavior: "contain",
	"& > div.tabTrack": {
		display: "flex",
		flexWrap: "nowrap",
		gap: gap,
		width: "max-content",
		"& > div > *": {
			flex: "0 0 100%",
		},
	},
});

export default SwipeContainer;
