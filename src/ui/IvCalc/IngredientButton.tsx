import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import IngredientIcon from './IngredientIcon';
import { IngredientName } from '../../data/pokemons';
import { Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const IngredientButton = React.memo(({ingredient, checked, onClick}: {
    ingredient: IngredientName,
    checked: boolean,
    onClick: (value: IngredientName) => void,
}) => {
    const onIngredientClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const value = e.currentTarget.value as IngredientName;
        onClick(value);
    }, [onClick]);
    return <StyledIngredientButton
        key={ingredient} value={ingredient} onClick={onIngredientClick}>
        <IngredientIcon name={ingredient}/>
        {checked && <CheckIcon/>}
    </StyledIngredientButton>;
});

const StyledIngredientButton = styled(Button)({
    width: '20%',
    height: '40px',
    color: 'white',
    fontSize: '0.9rem',
    padding: 0,
    margin: '0.2rem',
    borderRadius: '0.5rem',
    '& > svg.MuiSvgIcon-root[data-testid="CheckIcon"]': {
        position: 'absolute',
        background: '#24d76a',
        borderRadius: '15px',
        fontSize: '15px',
        border: '2px solid white',
        bottom: '0px',
        right: '10px',
    },
});

export default IngredientButton;
