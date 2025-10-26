import React from 'react';
import { styled } from '@mui/system';
import { Button, Dialog, DialogActions } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { formatWithComma } from '../../../util/NumberUtil';
import { StrengthResult } from '../../../util/PokemonStrength';
import SpecialtyButton from '../SpecialtyButton';
import { useTranslation } from 'react-i18next';

const TotalStrengthDialog = React.memo(({result, open, onClose}: {
    result: StrengthResult,
    open: boolean,
    onClose: () => void,
}) => {
    const { t } = useTranslation();

    return <StyledTotalStrengthDialog open={open} onClose={onClose}>
        <article>
            <h1>
                <LocalFireDepartmentIcon sx={{color: "#ff944b"}}/>
                <span style={{transform: 'scale(1, 0.9)'}}>{formatWithComma(Math.round(result.totalStrength))}</span>
            </h1>
            <div className="grid">
                <SpecialtyButton disabled specialty="Berries"/>
                <div>{formatWithComma(Math.round(result.berryTotalStrength))}</div>
                <SpecialtyButton disabled specialty="Ingredients"/>
                <div>{formatWithComma(Math.round(result.ingStrength))}</div>
                <SpecialtyButton disabled specialty="Skills"/>
                <div>{formatWithComma(Math.round(result.skillStrength + result.skillStrength2))}</div>
            </div>
            <p style={{marginTop: 0}}>{t('strength detail1')}</p>
            <p>{t('strength detail2')}</p>
            <ul style={{paddingLeft: '1rem'}}>
                <li>{t('strength restriction2')}</li>
            </ul>
        </article>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledTotalStrengthDialog>;
});

const StyledTotalStrengthDialog = styled(Dialog)({
    '& article': {
        margin: '0.8rem 0.8rem 0 0.8rem',
        '& > h1': {
            fontSize: '1.4rem',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
        },
        '& > div.grid': {
            margin: '0.2rem 0 1.5rem 1rem',
            display: 'grid',
            gridTemplateColumns: 'min-content min-content',
            gridGap: '0.2rem 0.5rem',
            alignItems: 'center',
            '& > div': {
                textAlign: 'right',
                fontWeight: 'bold',
            },
        },
        '& > p': {
            margin: '0.5rem 0',
            fontSize: '0.9rem',
        },
        '& > ul': {
            margin: 0,
            fontSize: '0.9rem',
        }
    },
});

export default TotalStrengthDialog;
