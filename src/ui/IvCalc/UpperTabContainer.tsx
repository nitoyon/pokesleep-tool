import React from 'react';
import { useSpring, animated } from '@react-spring/web'
import { styled } from '@mui/system';
import { useSwipeGesture } from '../common/Hook';

/**
 * Upper tab container in the IV calc app.
 *
 * @example
 * ```tsx
 * <UpperTabContainer index={tabIndex} width={width}
 *     height={height} onHeightChange={setHeight}
 *     onChange={setTabIndex}
 * >
 *     <div className="tabChild">
 *         content 1
 *     </div>
 *     <div className="tabChild">
 *         content 2
 *     </div>
 * </UpperTabContainer>
 * ```
 *
 * @param index The current active tab index.
 * @param width The width of the container.
 * @param height The height of the container.
 * @param children Tab contents to be rendered side by side.
 * @param onHeightChange Callback when the height of the container changes.
 * @param onChange Callback fired when the tab index changes via swipe gesture.
 */
const UpperTabContainer = React.memo(({index, children, height, width, onHeightChange, onChange}: {
    index: number,
    children: React.ReactNode,
    width: number,
    height: number,
    onHeightChange: (height: number) => void,
    onChange: (value: number) => void,
}) => {
    const length = Array.isArray(children) ? children.length : 0;
    const childRefs = React.useRef<(HTMLDivElement | null)[]>(Array(length).fill(null));

    const [{ springHeight, x }, api] = useSpring(() => ({
        springHeight: height,
        x: -index * width,
    }), [height, index, width]);

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
        api.set({ x: -index * width });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Animate when index has been changed or width changes
    const prevIndexRef = React.useRef(index);
    React.useEffect(() => {
        api.start({
            x: -index * width,
            immediate: prevIndexRef.current === index,
        });
        prevIndexRef.current = index;
    }, [index, width, api]);

    // Update height based on current tab
    const prevHeightIndexRef = React.useRef(index);
    React.useEffect(() => {
        const el = childRefs.current[index];
        if (!el) {
            return;
        }

        // Defer measurement to next frame to ensure layout is complete
        requestAnimationFrame(() => {
            const currentHeight = el.clientHeight || 0;
            onHeightChange(currentHeight);
            api.start({
                springHeight: currentHeight,
                immediate: prevHeightIndexRef.current === index,
            });
            prevHeightIndexRef.current = currentHeight;
        });
    }, [index, api, onHeightChange]);

    // Observe height changes of the current tab
    React.useEffect(() => {
        const el = childRefs.current[index];
        if (!el) {
            return;
        }

        const observer = new ResizeObserver(() => {
            const currentHeight = el.clientHeight;
            onHeightChange(currentHeight);
            api.start({ springHeight: currentHeight });
        });

        observer.observe(el);
        return () => {
            observer.disconnect();
        };
    }, [index, children, api, onHeightChange]);

    // Do not render if children is not an array
    if (!Array.isArray(children)) {
        return null;
    }

    return <StyledUpperTabContainer {...bind()}>
        <animated.div className="tabTrack"
            style={{ height: springHeight, x }}
        >
            {children.map((child, i) =>
                <div style={{ width }} key={i} ref={el => childRefs.current[i] = el}>
                    {child}
                </div>)
            }
        </animated.div>
    </StyledUpperTabContainer>;
});

const StyledUpperTabContainer = styled('div')({
    touchAction: 'pan-y',
    '& > div.tabTrack': {
        display: 'flex',
        alignItems: 'start',
        flexWrap: 'nowrap',
        width: 'max-content',
        willChange: 'height, transform',
        overflow: 'hidden',
        '& > div': {
            position: 'relative',
            '& > div': {
                flex: '0 0 100%',
            }
        },
    },
});

export default UpperTabContainer;
