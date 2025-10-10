import React from 'react';
import { useSpring, animated } from '@react-spring/web'
import { styled } from '@mui/system';

/**
 * Upper tab container in the IV calc app.
 *
 * @example
 * ```tsx
 * <UpperTabContainer index={tabIndex}
 *     height={height} onHeightChange={setHeight}
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
 * @param height The height of the container.
 * @param children Tab contents to be rendered side by side.
 * @param onHeightChange Callback when the height of the container changes.
 */
const UpperTabContainer = React.memo(({index, children, height, onHeightChange}: {
    index: number,
    children: React.ReactNode,
    height: number,
    onHeightChange: (height: number) => void,
}) => {
    const length = Array.isArray(children) ? children.length : 0;
    const childRef = React.useRef<HTMLDivElement | null>(null);

    const [{ springHeight }, api] = useSpring(() => ({
        springHeight: height,
    }), [height]);

    // Set initial position after initial render
    React.useEffect(() => {
        const el = childRef.current;
        if (!el) {
            return;
        }

        const initHeight = el.clientHeight || 0;
        onHeightChange(initHeight);
        api.set({ springHeight: initHeight });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Move to appropriate position when index changes
    const prevIndexRef = React.useRef(index);
    React.useEffect(() => {
        const el = childRef.current;
        if (!el) {
            return;
        }

        const currentHeight = el.clientHeight || 0;
        onHeightChange(currentHeight);
        api.start({
            springHeight: currentHeight,
            immediate: prevIndexRef.current === index,
        });
        prevIndexRef.current = index;
    }, [index, api, onHeightChange]);

    // Observe height changes of the current tab
    React.useEffect(() => {
        const el = childRef.current;
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
    if (index < 0 || index >= length) {
        return null;
    }

    return <StyledUpperTabContainer>
        <animated.div className="tabTrack"
            style={{height: springHeight}}
        >
            <div ref={childRef}>
                {children[index]}
            </div>
        </animated.div>
    </StyledUpperTabContainer>;
});

const StyledUpperTabContainer = styled('div')({
    overflow: 'hidden',
});

export default UpperTabContainer;
