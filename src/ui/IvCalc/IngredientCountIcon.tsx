import React from 'react';
import { styled } from '@mui/system';
import { IngredientName } from '../../data/pokemons';
import { Badge } from '@mui/material';
import IngredientIcon from './IngredientIcon';

const IngredientBadge = styled(Badge)(({ theme }) => ({
    marginRight: '.8rem',
    width: 26,
    height: 26,
    '& .MuiBadge-badge': {
        top: 23,
        right: 4,
        border: '1px solid #ccbb88',
        fontSize: '0.5rem',
        height: '0.7rem',
        width: '0.8rem',
        color: "#000",
        backgroundColor: "#ffffff",
        boxShadow: '0 1px 2px 1px rgba(128, 128, 128, 0.4)',
        zIndex: 0,
    },
    '& > svg': {
        width: '20px',
        height: '20px',
    },
}));

const IngredientCountIcon = React.memo(({name, count}: {
    name: IngredientName,
    count: number,
}) => {
    if (name === "unknown") {
        return <span style={{padding: '0 0.7rem 0 0.2rem'}}>
            <IngredientIcon name={name}/>
        </span>;
    }
    return <IngredientBadge badgeContent={"×"+count}>
        <IngredientIcon name={name}/>
    </IngredientBadge>;
});

export default IngredientCountIcon;
