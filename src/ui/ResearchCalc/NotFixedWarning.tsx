import React from 'react';
import { styled } from '@mui/system';
import { Collapse } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from 'react-i18next';

const NotFixedWarning = React.memo(({fieldIndex}: {
    fieldIndex: number,
}) => {
    const { t } = useTranslation();
    const isVisible = (fieldIndex === 5);

    return <Collapse in={isVisible}>
        <StyledNotFixedWarning>
            <InfoOutlinedIcon/>
            <div>{t('border is not fixed')}</div>
        </StyledNotFixedWarning>
    </Collapse>;
});

const StyledNotFixedWarning = styled('div')({
    background: '#e5f6fd',
    border: '1px solid #d9e9e9',
    borderRadius: '.5rem',
    paddingTop: '0.2rem',
    color: '#014343',
    display: 'grid',
    gridTemplateColumns: '26px 1fr',
    '& > svg': {
        color: '#0288d1',
        width: '18px',
        height: '18px',
        padding: '4px',
    },
    '& > div': {
        fontSize: '0.8rem',
        color: '#014480',
        '& > button': {
            padding: '0 0 0 0.3rem',
            minWidth: 0,
            fontSize: '0.8rem',
        },
    },
});

export default NotFixedWarning;