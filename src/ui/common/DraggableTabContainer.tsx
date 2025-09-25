import React from 'react';
import { styled } from '@mui/system';
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'

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
 */
const DraggableTabContainer = React.memo(({index, width, children, onChange}: {
    index: number,
    width: number,
    children: React.ReactNode,
    onChange: (value: number) => void,
}) => {
    const isFirstTime = React.useRef(true);
    const length = Array.isArray(children) ? children.length : 0;
    const widthGap = width + gap;

    const [{x}, api] = useSpring(() => ({
        x: -index * widthGap,
    }), [index, widthGap]);

    const bind = useDrag(({ active, movement: [mx], velocity: [vx], cancel}) => {
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
            newIndex = Math.max(0, Math.min(length - 1, newIndex));
        }
        if (newIndex !== index) {
            onChange(newIndex);
        }

        return api.start({
            x: -newIndex * widthGap,
        });
    }, {
        from: [-index * widthGap, 0],
        bounds: () => ({
            left: (index === length - 1 ? -widthGap * (length - 1) - bound : -Infinity),
            right: (index === 0 ? bound : Infinity),
        }),
        rubberband: true,
    });

    React.useEffect(() => {
        if (isFirstTime.current) {
            api.set({ x: -index * widthGap });
        }
        else {
            api.start({ x: -index * widthGap });
        }
        isFirstTime.current = false;
    }, [index, width, api]);

    if (!Array.isArray(children)) {
        return null;
    }

    return <StyledDraggableTabContainer {...bind()}>
        <animated.div className="tabTrack" style={{x}}>
            {children.map((child, i) =>
                <div style={{width}} key={i}>
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
        '& > *': {
            flex: '0 0 100%',
        },
    },
});

export default DraggableTabContainer;
