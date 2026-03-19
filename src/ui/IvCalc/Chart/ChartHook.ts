import React from 'react';

export interface MousePosition {
    x: number;
    y: number;
    svgX: number;
}

export function useSvgTouch(svgRef: React.MutableRefObject<SVGSVGElement|null>) {
    const [mousePos, setMousePos] = React.useState<MousePosition|null>(null);

    // Update mouseX state by mouse or touch event
    const updateMousePosition = React.useCallback((x: number, y: number) => {
        if (svgRef.current === null) { return; }
        // convert HTML coordinates to SVG coordinates
        const svg = svgRef.current as SVGSVGElement;
        const pt = svg.createSVGPoint();
        pt.x = x;
        pt.y = y;
        const ctm = svg.getScreenCTM();
        if (!ctm) {
            return;
        }
        const p = pt.matrixTransform(ctm.inverse());
        setMousePos({x, y, svgX: p.x});
    }, [svgRef]);

    const onTouchMove = React.useCallback((e: TouchEvent) => {
        updateMousePosition(e.touches[0].pageX, e.touches[0].pageY);
    }, [updateMousePosition]);
    const onTouchEnd = React.useCallback(() => {
        setMousePos(null);
    }, []);
    const onMouseMove = React.useCallback((e: MouseEvent) => {
        if ('ontouchstart' in window) { return; }
        updateMousePosition(e.pageX, e.pageY);
    }, [updateMousePosition]);
    const onMouseLeave = React.useCallback(() => {
        setMousePos(null);
    }, []);

    React.useEffect(() => {
        if (svgRef.current === null) {
            return;
        }
        const elm = svgRef.current;
        elm.addEventListener("touchstart", onTouchMove);
        elm.addEventListener("touchmove", onTouchMove);
        elm.addEventListener("touchend", onTouchEnd);
        elm.addEventListener("mousemove", onMouseMove);
        elm.addEventListener("mouseleave", onMouseLeave);
        return () => {
            elm.removeEventListener("touchstart", onTouchMove);
            elm.removeEventListener("touchmove", onTouchMove);
            elm.removeEventListener("touchend", onTouchEnd);
            elm.removeEventListener("mousemove", onMouseMove);
            elm.removeEventListener("mouseleave", onMouseLeave);
        };
    }, [svgRef, onTouchMove, onTouchEnd, onMouseMove, onMouseLeave]);
    return mousePos;
}
