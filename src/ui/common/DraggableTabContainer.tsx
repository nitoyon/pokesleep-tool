import React from 'react';
import { styled } from '@mui/system';
import { useSpring, animated } from '@react-spring/web'
import { useSwipeGesture } from './Hook';
import { clamp } from '../../util/NumberUtil';

/** Gap between each tab (in pixels) */
const gap = 20;

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
    const length = Array.isArray(children) ? children.length : 0;

    const [{x}, api] = useSpring(() => ({
        x: -index * (width + gap),
    }), [index, width]);

    const { bind, offset } = useSwipeGesture({
        index, length, width, gap, onChange,
    });

    // Update spring animation based on drag offset
    React.useEffect(() => {
        if (offset === 0) {
            return;
        }
        api.set({ x: -index * (width + gap) + offset });
    }, [offset, index, width, api]);

    // Set initial position after width is known
    React.useEffect(() => {
        api.set({ x: -index * (width + gap) });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Animate when index has been changed
    // Move to appropriate position when width changes
    const prevIndexRef = React.useRef(index);
    React.useEffect(() => {
        api.start({
            x: -index * (width + gap),
            immediate: prevIndexRef.current === index,
        });
        prevIndexRef.current = index;
    }, [index, width, api]);

    // Do not render if children is not an array
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
        '& > div > *': {
            flex: '0 0 100%',
        },
    },
});

export default DraggableTabContainer;
