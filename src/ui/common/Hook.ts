import React from 'react';

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

