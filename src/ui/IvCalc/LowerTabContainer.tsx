import React from 'react';
import { useSpring, animated } from '@react-spring/web'
import { styled } from '@mui/system';
import { useSwipeGesture } from '../common/Hook';

/**
 * Lower tab container in the IV calc app.
 *
 * @example
 * ```tsx
 * <LowerTabContainer index={tabIndex} y={y} width={width}
 *     onChange={setTabIndex}
 * >
 *     <div className="tabChild">
 *         content 1
 *     </div>
 *     <div className="tabChild">
 *         content 2
 *     </div>
 * </LowerTabContainer>
 * ```
 *
 * @param index The current active tab index.
 * @param y The vertical position of the container.
 * @param width The width of the container.
 * @param onChange Callback fired when the tab index changes via swipe gesture.
 */
const LowerTabContainer = React.memo(({index, children, y, width, onChange}: {
    index: number,
    children: React.ReactNode,
    y: number,
    width: number,
    onChange: (value: number) => void,
}) => {
    const length = Array.isArray(children) ? children.length : 0;
    const childRefs = React.useRef<(HTMLDivElement | null)[]>(Array(length).fill(null));

    const [{ springY, x }, api] = useSpring(() => ({
        springY: y,
        x: -index * width,
    }), [index, width]);

    const { bind, offset } = useSwipeGesture({
        index,
        length,
        width,
        onChange,
    });

    // Update spring animation based on drag offset
    React.useEffect(() => {
        if (offset === 0) {
            return;
        }
        api.set({ x: -index * width + offset });
    }, [offset, index, width, api]);

    // Set initial position after width is known
    React.useEffect(() => {
        api.set({ x: -index * width, springY: y });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Animate when index has been changed or width changes
    const prevIndexRef = React.useRef(index);
    React.useEffect(() => {
        const shouldAnimate = prevIndexRef.current !== index;
        api.start({
            x: -index * width,
            immediate: !shouldAnimate,
        });
        prevIndexRef.current = index;
    }, [index, width, api]);

    // Move to appropriate position when y changes
    const initialY = React.useRef(y);
    const prevYRef = React.useRef(y);
    const isFirstTime = React.useRef(true);
    React.useEffect(() => {
        api.start({
            springY: y,
            immediate: isFirstTime.current || prevYRef.current === y,
        });
        prevYRef.current = y;

        // Assume first time if y is not changed from initial value
        isFirstTime.current &&= initialY.current === y;
    }, [y, api]);

    // Do not render if children is not an array
    if (!Array.isArray(children)) {
        return null;
    }

    return <StyledLowerTabContainer {...bind()}>
        <animated.div className="tabTrack"
            style={{top: springY, x}}
        >
            {children.map((child, i) =>
                <div style={{ width }} key={i} ref={el => childRefs.current[i] = el}>
                    {child}
                </div>)
            }
        </animated.div>
    </StyledLowerTabContainer>;
});

const StyledLowerTabContainer = styled('div')({
    touchAction: 'pan-y',
    '& > .tabTrack': {
        position: 'fixed',
        bottom: 0,
        display: 'flex',
        alignItems: 'start',
        flexWrap: 'nowrap',
        width: 'max-content',
        willChange: 'transform',
        overflow: 'auto',
        '& > div': {
            position: 'relative',
            '& > div': {
                flex: '0 0 100%',
            }
        },
    },
});

export default LowerTabContainer;
