import React from 'react';
import { styled } from '@mui/system';
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { clamp } from '../../util/NumberUtil';

/** Gap between each tab (in pixels) */
const gap = 20;

/** Drag bounds beyond the container (in pixels) */
const bound = 20;

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
const DraggableTabContainer = React.memo(({index, width, children, onChange, fitHeight = false}: {
    index: number,
    width: number,
    children: React.ReactNode,
    onChange: (value: number) => void,
    fitHeight?: boolean,
}) => {
    const isFirstTime = React.useRef(true);
    const length = Array.isArray(children) ? children.length : 0;
    const widthGap = width + gap;

    // Refs and state for fitHeight
    const childRefs = React.useRef<(HTMLDivElement | null)[]>([]);
    const childHeightsRef = React.useRef<number[]>([]);
    const [activeHeight, setActiveHeight] = React.useState<number>(0);
    const indexRef = React.useRef(index);
    indexRef.current = index;

    const [{x}, api] = useSpring(() => ({
        x: -index * widthGap,
        immediate: isFirstTime.current,
    }), [index, widthGap]);

    const bind = useDrag(({ active, movement: [mx], velocity: [vx]}) => {
        if (active) {
            return api.start({
                x: -index * widthGap + mx,
                immediate: true,
            });
        }

        const changed = (Math.abs(vx) > 0.2 ||
            Math.abs(mx) > width / 2);
        let newIndex = index;
        if (changed) {
            newIndex += mx > 0 ? -1 : 1;
            newIndex = clamp(0, newIndex, length - 1);
        }
        if (newIndex !== index) {
            onChange(newIndex);
        }

        return api.start({
            x: -newIndex * widthGap,
            immediate: isFirstTime.current,
        });
    }, {
        from: [-index * widthGap, 0],
        filterTaps: true,
        bounds: () => ({
            left: (index === length - 1 ? -widthGap * (length - 1) - bound : -Infinity),
            right: (index === 0 ? bound : Infinity),
        }),
        rubberband: true,
    });

    React.useEffect(() => {
        if (isFirstTime.current) {
            api.set({ x: -index * widthGap });

            // Set isFirstTime to false in the next frame
            // to avoid animation on the initial render
            requestAnimationFrame(() => {
                isFirstTime.current = false;
            });
        }
        else {
            api.start({ x: -index * widthGap });
        }
    }, [index, widthGap, api]);

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
    }, [fitHeight, length]);

    // Callback ref factory for child wrappers
    const setChildRef = React.useCallback((i: number) => (el: HTMLDivElement | null) => {
        childRefs.current[i] = el;
    }, []);

    if (!Array.isArray(children)) {
        return null;
    }

    const trackStyle = fitHeight ? {x, alignItems: 'flex-start' as const} : {x};
    const containerStyle = fitHeight && activeHeight > 0
        ? {height: activeHeight} : undefined;

    return <StyledDraggableTabContainer style={containerStyle} {...bind()}>
        <animated.div className="tabTrack" style={trackStyle}>
            {children.map((child, i) =>
                <div style={{width}} key={i} ref={setChildRef(i)}>
                    {child}
                </div>)
            }
        </animated.div>
    </StyledDraggableTabContainer>;
});

const StyledDraggableTabContainer = styled('div')({
    overflow: 'hidden',
    touchAction: 'pan-y',
    overscrollBehavior: 'contain',
    '& > div.tabTrack': {
        display: 'flex',
        flexWrap: 'nowrap',
        gap: gap,
        width: 'max-content',
        '& > div > *': {
            flex: '0 0 100%',
        },
    },
});

export default DraggableTabContainer;
