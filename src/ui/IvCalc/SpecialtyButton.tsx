import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import { PokemonSpecialty } from '../../data/pokemons';
import { Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';

const SpecialtyButton = React.memo(({specialty, checked, onClick}: {
    specialty: PokemonSpecialty,
    checked: boolean,
    onClick: (value: PokemonSpecialty) => void,
}) => {
    const { t } = useTranslation();
    const onTypeClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const value = e.currentTarget.value as PokemonSpecialty;
        onClick(value);
    }, [onClick]);

    let spec: string = "";
    switch (specialty) {
        case "Berries": spec = "berry"; break;
        case "Ingredients": spec = "ingredient"; break;
        case "Skills": spec = "skill"; break;
    }

    return <StyledSpecialtyButton
            key={specialty} className={`${spec} ${checked ? 'checked' : ''}`} value={specialty}
            onClick={onTypeClick}>
            {t(spec)}
            {checked && <CheckIcon/>}
        </StyledSpecialtyButton>;
});

const StyledSpecialtyButton = styled(Button)({
    width: '5.5rem',
    color: 'white',
    fontSize: '0.8rem',
    padding: 0,
    margin: '0.2rem',
    borderRadius: '1rem',
    textTransform: 'none',
    '& > svg': {
        position: 'absolute',
        background: '#24d76a',
        borderRadius: '10px',
        fontSize: '15px',
        border: '2px solid white',
        right: 'calc(50%-15px)',
        top: 'calc(50%-15px)',
    },
    '&.berry': { backgroundColor: '#24d76a' },
    '&.berry.checked': { backgroundColor: '#bde9bb' },
    '&.ingredient': { backgroundColor: '#fab855' },
    '&.ingredient.checked': { backgroundColor: '#f3dcb3' },
    '&.skill': { backgroundColor: '#44a2fd' },
    '&.skill.checked': { backgroundColor: '#b8d0fa' },
});

export default SpecialtyButton;
