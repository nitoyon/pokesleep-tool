import React from 'react';
import { useTranslation } from 'react-i18next';

const RpLabel = React.memo(({rp}: {rp: number}) => {
    const { t } = useTranslation();

    return (<div style={{transform: 'scale(1, 0.9)'}}>
        <span style={{
            color: '#fd775d',
            fontWeight: 'bold',
            paddingRight: '.4rem',
            fontSize: '.8rem',
            verticalAlign: '15%',
        }}>{t('rp')}</span>
        <span style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
        }}>{t('num', {n: rp})}</span>
    </div>);
});

export default RpLabel;
