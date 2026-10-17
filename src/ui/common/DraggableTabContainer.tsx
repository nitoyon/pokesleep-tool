import { animated } from "@react-spring/web";
import React from "react";
import SwipeContainer from "./SwipeContainer";

/**
 * A container component that enables drag gesture for
 * horizontal tab content.
 *
 * @example
 * ```tsx
 * <DraggableTabContainer index={tabIndex} width={width}
 *     onChange={setTabIndex}
 * >
 *     <div className="tabChild">
 *         content 1
 *     </div>
 *     <div className="tabChild">
 *         content 2
 *     </div>
 * </DraggableTabContainer>
 * ```
 *
 * @param index The current active tab index.
 * @param width The width of each tab (in pixels).
 * @param children Tab contents to be rendered side by side.
 * @param onChange Callback fired when the tab index changes.
 * @param fitHeight When true, sets the container height to match the active tab's content height.
 */
const DraggableTabContainer = React.memo(
	({
		index,
		width,
		children,
		onChange,
		fitHeight = false,
	}: {
		index: number;
		width: number;
		children: React.ReactNode;
		onChange: (value: number) => void;
		fitHeight?: boolean;
	}) => {
		// Refs and state for fitHeight
		const childRefs = React.useRef<(HTMLDivElement | null)[]>([]);
		const childHeightsRef = React.useRef<number[]>([]);
		const [activeHeight, setActiveHeight] = React.useState<number>(0);
		const indexRef = React.useRef(index);
		indexRef.current = index;

		// Update activeHeight when index changes
		React.useEffect(() => {
			if (fitHeight && childHeightsRef.current[index]) {
				setActiveHeight(childHeightsRef.current[index]);
			}
		}, [fitHeight, index]);

		// ResizeObserver setup for fitHeight
		React.useEffect(() => {
			if (!fitHeight) return;

			const observer = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const el = entry.target as HTMLDivElement;
					const idx = childRefs.current.indexOf(el);
					if (idx !== -1) {
						const h = el.getBoundingClientRect().height;
						childHeightsRef.current[idx] = h;
						if (idx === indexRef.current) {
							setActiveHeight(h);
						}
					}
				}
			});

			childRefs.current.forEach((el) => {
				if (el) observer.observe(el);
			});

			return () => {
				observer.disconnect();
			};
		}, [fitHeight]);

		// Callback ref factory for child wrappers
		const setChildRef = React.useCallback(
			(i: number) => (el: HTMLDivElement | null) => {
				childRefs.current[i] = el;
			},
			[],
		);

		if (!Array.isArray(children)) {
			return null;
		}

		const trackStyle = fitHeight
			? { alignItems: "flex-start" as const }
			: undefined;
		const containerStyle =
			fitHeight && activeHeight > 0 ? { height: activeHeight } : undefined;

		return (
			<SwipeContainer
				index={index}
				min={0}
				max={children.length - 1}
				width={width}
				onIndexChange={onChange}
				style={containerStyle}
			>
				{(x) => (
					<animated.div className="tabTrack" style={{ ...trackStyle, x }}>
						{children.map((child, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: tabs never reordered
							<div style={{ width }} key={i} ref={setChildRef(i)}>
								{child}
							</div>
						))}
					</animated.div>
				)}
			</SwipeContainer>
		);
	},
);

export default DraggableTabContainer;
