import React from "react";
import { animated, useSpring } from "react-spring";

const springConfig = { tension: 400, friction: 40 };

/**
 * A customized Collapse component that animates the height and caches
 * its children when hidden.
 */
const CollapseEx = React.memo(
	({ show, children }: { show: boolean; children: React.ReactNode }) => {
		const ref = React.useRef<HTMLDivElement>(null);
		const [renderedChildren, setRenderedChildren] = React.useState(children);
		// true when fully expanded and the height is `auto`
		const [auto, setAuto] = React.useState(show);
		const showRef = React.useRef(show);
		const [styles, api] = useSpring(() => ({
			height: 0,
			config: springConfig,
		}));

		React.useEffect(() => {
			if (show) {
				setRenderedChildren(children);
			}
		}, [children, show]);

		const getContentHeight = React.useCallback(
			() => (ref.current ? ref.current.scrollHeight : 0),
			[],
		);

		const expand = React.useCallback(() => {
			api.start({
				height: getContentHeight(),
				onRest: (result) => {
					if (result.finished && showRef.current) {
						setAuto(true);
					}
				},
			});
		}, [api, getContentHeight]);

		React.useLayoutEffect(() => {
			// Animate only when `show` actually changes
			if (showRef.current === show) {
				return;
			}
			showRef.current = show;
			if (show) {
				expand();
			} else {
				// Start from the current actual height
				const height = getContentHeight();
				setAuto(false);
				api.start({ from: { height }, to: { height: 0 } });
			}
		}, [show, api, expand, getContentHeight]);

		// Follow content size changes while the expanding animation runs
		React.useEffect(() => {
			const elm = ref.current;
			if (!elm || auto || !show) {
				return;
			}
			const observer = new ResizeObserver(() => expand());
			observer.observe(elm);
			return () => observer.disconnect();
		}, [auto, show, expand]);

		return (
			<animated.div
				style={{
					height: auto ? "auto" : styles.height,
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
