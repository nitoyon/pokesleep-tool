import React from "react";

/**
 * Custom React hook to get the width of a DOM element.
 *
 * Sets up a `ResizeObserver` to track width changes and returns
 * both the current width and a ref callback to attach to the element.
 *
 * @example
 * ```tsx
 * const [width, ref] = useElementWidth();
 * return <div ref={ref}>Width: {width}px</div>;
 * ```
 *
 * @returns `[width, ref]` — A tuple containing:
 * - `width`: The current width of the element in pixels.
 * - `ref`: A callback ref to attach to the target HTML element.
 */
export function useLongPress(callback: () => void, ms: number) {
	const timeout = React.useRef<NodeJS.Timeout | null>(null);
	const ref = React.useRef<HTMLButtonElement | null>(null);

	const touchStart = React.useCallback(() => {
		timeout.current = setTimeout(callback, ms);
	}, [callback, ms]);
	const touchEnd = React.useCallback(() => {
		if (timeout.current) {
			clearTimeout(timeout.current);
		}
		timeout.current = null;
	}, []);

	const mouseEnd = React.useCallback(() => {
		document.removeEventListener("mousemove", mouseEnd);
		document.removeEventListener("mouseup", mouseEnd);
		if (timeout.current) {
			clearTimeout(timeout.current);
		}
		timeout.current = null;
	}, []);
	const mouseStart = React.useCallback(() => {
		if (timeout.current !== null) {
			return;
		}
		timeout.current = setTimeout(callback, ms);
		document.addEventListener("mousemove", mouseEnd);
		document.addEventListener("mouseup", mouseEnd);
	}, [callback, ms, mouseEnd]);

	React.useEffect(() => {
		if (ref.current === null) {
			return () => {};
		}
		const elm = ref.current;
		elm.addEventListener("touchstart", touchStart);
		elm.addEventListener("mousedown", mouseStart);
		elm.addEventListener("touchmove", touchEnd);
		elm.addEventListener("touchend", touchEnd);
		return () => {
			elm.removeEventListener("touchstart", touchStart);
			elm.removeEventListener("mousedown", mouseStart);
			elm.removeEventListener("touchmove", touchEnd);
			elm.removeEventListener("touchend", touchEnd);
		};
	}, [mouseStart, touchStart, touchEnd]);
	return ref;
}

export function useElementWidth(): [number, (elm: HTMLElement | null) => void] {
	const elmRef = React.useRef<{ elm: HTMLElement | null }>({ elm: null });
	const [width, setWidth] = React.useState(200);
	const observer = React.useMemo(() => {
		return new ResizeObserver(() => {
			const node = elmRef.current.elm;
			if (node === null) {
				return;
			}
			setWidth(Math.floor(node.getBoundingClientRect().width));
		});
	}, []);

	const ref = React.useCallback(
		(node: HTMLElement | null) => {
			if (node === null) {
				observer.disconnect();
				return;
			}
			elmRef.current.elm = node;
			setWidth(Math.floor(node.getBoundingClientRect().width));
			observer.disconnect();
			observer.observe(node);
		},
		[observer],
	);
	return [width, ref];
}
