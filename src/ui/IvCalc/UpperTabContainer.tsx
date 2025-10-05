import React from 'react';
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

    // Do not render if children is not an array
    if (!Array.isArray(children)) {
        return null;
    }
    if (index < 0 || index >= length) {
        return null;
    }

    return <StyledUpperTabContainer>
        {children[index]}
    </StyledUpperTabContainer>;
});

const StyledUpperTabContainer = styled('div')({
});

export default UpperTabContainer;
