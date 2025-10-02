import React from 'react';
import { animated, useSpring } from 'react-spring';

/**
 * A customized Collapse component that animates the height and caches
 * its children when hidden.
 */
const CollapseEx = React.memo(({show, children}: {
    show: boolean,
    children: React.ReactNode,
}) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [height, setHeight] = React.useState(0);
    const [renderedChildren, setRenderedChildren] = React.useState(children);
    const isFirstRender = React.useRef(true);

    React.useEffect(() => {
        if (show) {
            setRenderedChildren(children);
        }
    }, [children, show]);

    React.useLayoutEffect(() => {
        setHeight(ref.current ? ref.current.scrollHeight : 0);
    }, [renderedChildren, show]);

    const styles = useSpring({
        height: show ? height : 0,
        config: { tension: 400, friction: 40 },
        immediate: isFirstRender.current,
        onRest: () => {
            isFirstRender.current = false;
        },
    });

    return <animated.div style={{...styles, overflow: 'hidden'}}>
        <div ref={ref}>
            {renderedChildren}
        </div>
    </animated.div>;
});

export default CollapseEx;
