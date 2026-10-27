import React from "react";
import { animated, useSpringValue } from "react-spring";

const springConfig = { tension: 400, friction: 40 };

/**
 * A customized Collapse component that animates the height and caches
 * its children when hidden.
 */
const CollapseEx = React.memo(
	({ show, children }: { show: boolean; children: React.ReactNode }) => {
		const outerRef = React.useRef<HTMLDivElement>(null);
		const ref = React.useRef<HTMLDivElement>(null);
		const [renderedChildren, setRenderedChildren] = React.useState(children);
		// true when fully expanded and the height is `auto`
		const [auto, setAuto] = React.useState(show);
		const autoRef = React.useRef(show);
		const showRef = React.useRef(show);
		const lastHeightRef = React.useRef(-1);
		const height = useSpringValue(0, { config: springConfig });

		const changeAuto = React.useCallback((value: boolean) => {
			autoRef.current = value;
			setAuto(value);
		}, []);

		React.useEffect(() => {
			if (show) {
				setRenderedChildren(children);
			}
		}, [children, show]);

		const getContentHeight = React.useCallback(
			() => (ref.current ? ref.current.scrollHeight : 0),
			[],
		);

		const animateTo = React.useCallback(
			(to: number, from?: number) => {
				height.start({
					from,
					to,
					onRest: (result) => {
						if (result.finished && showRef.current) {
							changeAuto(true);
						}
					},
				});
			},
			[height, changeAuto],
		);

		React.useLayoutEffect(() => {
			// Animate only when `show` actually changes
			if (showRef.current === show) {
				return;
			}
			showRef.current = show;
			if (show) {
				animateTo(getContentHeight());
			} else {
				// Start from the current actual height
				changeAuto(false);
				height.start({ from: getContentHeight(), to: 0 });
			}
		}, [show, height, animateTo, changeAuto, getContentHeight]);

		// Follow content size changes while shown
		React.useEffect(() => {
			const elm = ref.current;
			if (!elm || !show) {
				return;
			}
			lastHeightRef.current = getContentHeight();
			const observer = new ResizeObserver(() => {
				const prev = lastHeightRef.current;
				const next = getContentHeight();
				lastHeightRef.current = next;
				if (!autoRef.current) {
					// Expanding: update the target height
					animateTo(next);
					return;
				}
				if (prev === next || prev < 0) {
					return;
				}
				if (outerRef.current) {
					outerRef.current.style.height = `${prev}px`;
				}
				changeAuto(false);
				animateTo(next, prev);
			});
			observer.observe(elm);
			return () => observer.disconnect();
		}, [show, animateTo, changeAuto, getContentHeight]);

		return (
			<animated.div
				ref={outerRef}
				style={{
					height: auto ? "auto" : height,
					overflow: "hidden",
				}}
			>
				{/*
				 * Use flow-root to prevent the children's vertical margins
				 * from collapsing through this div. Otherwise scrollHeight
				 * excludes those margins and the content gets clipped.
				 */}
				<div ref={ref} style={{ display: "flow-root" }}>
					{renderedChildren}
				</div>
			</animated.div>
		);
	},
);

export default CollapseEx;
