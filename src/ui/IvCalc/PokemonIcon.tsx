import React from 'react';
import { styled } from '@mui/system';
import PokemonIconData from './PokemonIconData';

const PokemonIcon = React.memo(({id, size}: {
    id: number,
    size: number,
}) => {
    const elements = createIconElements(id, size);
    return <StyledIconContainer style={{width: `${size}px`, height: `${size}px`}}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {elements}
        </svg>
    </StyledIconContainer>;
});

function createIconElements(id: number, size: number): React.ReactElement[] {
    if (!(id in PokemonIconData)) {
        return createEmptyIconElements(size);
    }

    const elements = PokemonIconData[id];
    const shape: React.ReactElement[] = [];
    let i = 0;
    for (const datum of elements) {
        const props: any = {};
        if (datum.r !== undefined) {
            props.rx = props.ry = (size * datum.r).toFixed(1);
        }
        shape.push(<rect key={i}
            x={(size * datum.x).toFixed(1)}
            y={(size * datum.y).toFixed(1)}
            width={(size * datum.w).toFixed(1)}
            height={(size * datum.h).toFixed(1)}
            fill={datum.color} {...props}/>);
        i++;
    }
    return shape;
}

function createEmptyIconElements(size: number): React.ReactElement[] {
    return [<rect x="0" y="0" width={size} height={size} fill="#bbbbbb"/>];
}

const StyledIconContainer = styled('div')({
    border: '1px solid #999',
    borderRadius: '.5rem',
    overflow: 'hidden',
});

export default PokemonIcon;
