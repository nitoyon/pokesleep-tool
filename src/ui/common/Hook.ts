import React from 'react';
import { useDrag } from '@use-gesture/react';

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
export function useElementWidth(): [number, (elm: HTMLElement|null) => void] {
    const elmRef = React.useRef<{elm: HTMLElement|null}>({elm: null});
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

    const ref = React.useCallback((node: HTMLElement|null) => {
        if (node === null) {
            observer.disconnect();
            return;
        }
        elmRef.current.elm = node;
        setWidth(Math.floor(node.getBoundingClientRect().width));
        observer.disconnect();
        observer.observe(node);
    }, [observer]);
    return [width, ref];
}

/**
 * Custom React hook for horizontal swipe gesture detection.
 *
 * Detects swipe gestures to navigate between tabs, with velocity and distance
 * thresholds. Includes rubberband effect at boundaries.
 *
 * @example
 * ```tsx
 * const { bind, offset } = useSwipeGesture({
 *   index: tabIndex,
 *   length: 3,
 *   width: containerWidth,
 *   onChange: setTabIndex,
 * });
 * return <div {...bind()}>Swipeable content</div>;
 * ```
 *
 * @param index Current active tab index.
 * @param length Total number of tabs.
 * @param width Width of the container (used for distance calculations).
 * @param onChange Callback fired when swipe gesture completes and index should change.
 * @param bound Drag bounds beyond the container in pixels. Default: 20.
 * @param gap Gap between tabs in pixels. Default: 20.
 * @returns Object containing:
 * - `bind`: Function to spread onto the draggable element.
 * - `offset`: Current drag offset in pixels (for animation during drag).
 * - `isDragging`: Boolean indicating if user is currently dragging.
 */
export function useSwipeGesture({
    index,
    length,
    width,
    onChange,
    bound = 20,
    gap = 20,
}: {
    index: number;
    length: number;
    width: number;
    onChange: (newIndex: number) => void;
    bound?: number;
    gap?: number;
}): {
    bind: ReturnType<typeof useDrag>;
    offset: number;
} {
    const [offset, setOffset] = React.useState(0);

    const bind = useDrag(
        ({ active, movement: [mx], velocity: [vx] }) => {
            if (active) {
                setOffset(mx);
                return;
            }

            const changed = Math.abs(vx) > 0.2 || Math.abs(mx) > width / 2;
            let newIndex = index;
            if (changed) {
                newIndex += mx > 0 ? -1 : 1;
                newIndex = Math.max(0, Math.min(length - 1, newIndex));
            }
            if (newIndex !== index) {
                onChange(newIndex);
            }

            setOffset(0);
        },
        {
            from: [-index * (width + gap), 0],
            filterTaps: true,
            bounds: () => ({
                left: index === length - 1 ? -(width + gap) * (length - 1) - bound : -Infinity,
                right: index === 0 ? bound : Infinity,
            }),
            rubberband: true,
        }
    );

    return { bind, offset };
}
