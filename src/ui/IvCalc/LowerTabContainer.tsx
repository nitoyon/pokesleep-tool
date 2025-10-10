import React from 'react';
import { useSpring, animated } from '@react-spring/web'
import { styled } from '@mui/system';

/**
 * Lower tab container in the IV calc app.
 *
 * @example
 * ```tsx
 * <LowerTabContainer index={tabIndex} y={y}>
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
 */
const LowerTabContainer = React.memo(({index, children, y}: {
    index: number,
    children: React.ReactNode,
    y: number,
}) => {
    const length = Array.isArray(children) ? children.length : 0;
    const childRef = React.useRef<HTMLDivElement | null>(null);

    const [{ springY }, api] = useSpring(() => ({
        springY: y,
    }), [y]);

    // Move to appropriate position when index or y changes
    const initialY = React.useRef(y);
    const prevIndexRef = React.useRef(index);
    const prevYRef = React.useRef(y);
    const isFirstTime = React.useRef(true);
    React.useEffect(() => {
        const el = childRef.current;
        if (!el) {
            return;
        }

        api.start({
            springY: y,
            immediate: isFirstTime.current ||
                (prevIndexRef.current === index && prevYRef.current === y),
        });
        prevIndexRef.current = index;
        prevYRef.current = y;

        // Assume first time if y is not changed from initial value
        isFirstTime.current &&= initialY.current === y;
    }, [y, index, api]);

    // Do not render if children is not an array
    if (!Array.isArray(children)) {
        return null;
    }
    if (index < 0 || index >= length) {
        return null;
    }

    return <StyledLowerTabContainer>
        <animated.div className="tabTrack"
            style={{top: springY}}
        >
            <div ref={childRef}>
                {children[index]}
            </div>
        </animated.div>
    </StyledLowerTabContainer>;
});

const StyledLowerTabContainer = styled('div')({
    '& > .tabTrack': {
        position: 'fixed',
        bottom: 0,
        width: '100%',
        overflow: 'auto',
    },
});

export default LowerTabContainer;
