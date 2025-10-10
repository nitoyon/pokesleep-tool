import React from 'react';
import { useSpring, animated } from '@react-spring/web'
import { styled } from '@mui/system';

/**
 * Upper tab container in the IV calc app.
 *
 * @example
 * ```tsx
 * <UpperTabContainer index={tabIndex}>
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
 * @param children Tab contents to be rendered side by side.
 */
const UpperTabContainer = React.memo(({index, children}: {
    index: number,
    children: React.ReactNode,
}) => {
    const length = Array.isArray(children) ? children.length : 0;
    const childRef = React.useRef<HTMLDivElement | null>(null);

    const [prevHeight, setPrevHeight] = React.useState(0);
    const [{ height }, api] = useSpring(() => ({
        height: prevHeight,
    }), [prevHeight]);

    // Set initial position after initial render
    React.useEffect(() => {
        const el = childRef.current;
        if (!el) {
            return;
        }

        const initHeight = el.clientHeight || 0;
        setPrevHeight(initHeight);
        api.set({ height: initHeight });
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
        setPrevHeight(currentHeight);
        api.start({
            height: currentHeight,
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
            setPrevHeight(currentHeight);
            api.start({ height: currentHeight });
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
            style={{height}}
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
