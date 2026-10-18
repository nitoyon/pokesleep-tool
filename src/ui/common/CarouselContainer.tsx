import { animated } from "@react-spring/web";
import React from "react";
import { mod } from "../../util/NumberUtil";
import SwipeContainer from "./SwipeContainer";

/**
 * A container component that shows horizontal tabs in a loop.
 * Moving past the last tab goes to the first tab and vice versa.
 *
 * @param index The current active tab index.
 * @param width The width of each tab (in pixels).
 * @param children Tab contents to be rendered side by side.
 * @param onChange Callback fired when the tab index changes.
 * @param ignoreDragSelector CSS selector of elements on which drag is not started.
 */
const CarouselContainer = React.memo(
	({
		index,
		width,
		children,
		onChange,
		ignoreDragSelector,
	}: {
		index: number;
		width: number;
		children: React.ReactNode;
		onChange: (value: number) => void;
		ignoreDragSelector?: string;
	}) => {
		const length = Array.isArray(children) ? children.length : 0;

		// Virtual index (see TabPosition.ts) that follows `index`.
		// Also updated when the drag ends so that the track keeps
		// moving in the drag direction across the end.
		const virtualIndexRef = React.useRef(index);
		virtualIndexRef.current = nearestVirtualIndex(
			virtualIndexRef.current,
			index,
			length,
		);
		const virtualIndex = virtualIndexRef.current;

		const onIndexChange = React.useCallback(
			(newVirtualIndex: number) => {
				virtualIndexRef.current = newVirtualIndex;
				onChange(mod(newVirtualIndex, length));
			},
			[onChange, length],
		);

		if (!Array.isArray(children)) {
			return null;
		}

		// Looping needs at least 2 tabs
		const isLoop = length > 1;

		return (
			<SwipeContainer
				index={virtualIndex}
				min={isLoop ? -Infinity : virtualIndex}
				max={isLoop ? Infinity : virtualIndex}
				width={width}
				onIndexChange={onIndexChange}
				ignoreDragSelector={ignoreDragSelector}
			>
				{(x, widthGap) => (
					// The track stays still and each tab is moved individually
					// (see getLoopTabOffset).
					<div className="tabTrack">
						{children.map((child, i) => (
							<animated.div
								// biome-ignore lint/suspicious/noArrayIndexKey: tabs never reordered
								key={i}
								style={{
									width,
									x: x.to((v) => getLoopTabOffset(i, v, widthGap, length)),
								}}
							>
								{child}
							</animated.div>
						))}
					</div>
				)}
			</SwipeContainer>
		);
	},
);

/**
 * Pure position calculations for CarouselContainer.
 *
 * CarouselContainer uses a "virtual index" that keeps increasing
 * (or decreasing) across the end so that the track moves in the same
 * direction as the drag.
 */

/**
 * Return the virtual index that points to `index` and is
 * the nearest to the current virtual index.
 *
 * @param current The current virtual index.
 * @param index The target tab index (0 to length - 1).
 * @param length The number of tabs.
 */
export function nearestVirtualIndex(
	current: number,
	index: number,
	length: number,
): number {
	let diff = mod(index - current, length);
	if (diff > length / 2) {
		diff -= length;
	}
	return current + diff;
}

/**
 * Return the horizontal offset of the i-th tab in a carousel.
 *
 * The track stays still and each tab is moved individually,
 * wrapped around so that it is placed within half the track
 * length from the viewport. This way, the neighbor tab always
 * exists on both sides of the active tab.
 *
 * @param i The tab index.
 * @param x The track position (in pixels).
 * @param widthGap The width of each tab plus the gap (in pixels).
 * @param length The number of tabs.
 */
export function getLoopTabOffset(
	i: number,
	x: number,
	widthGap: number,
	length: number,
): number {
	const trackLength = length * widthGap;
	const tabX = i * widthGap;
	return mod(tabX + x + trackLength / 2, trackLength) - trackLength / 2 - tabX;
}

export default CarouselContainer;
