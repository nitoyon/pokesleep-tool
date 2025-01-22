import React from 'react';
import PokemonIv from '../../util/PokemonIv';
import { rpEstimateThreshold } from '../../util/PokemonRp';
import { useTranslation } from 'react-i18next';

const RpLabel = React.memo(({rp, iv}: {rp: number, iv: PokemonIv}) => {
    const { t } = useTranslation();
    const isEstimated = iv.level > rpEstimateThreshold;

    return (<div>
        <span style={{
            color: '#fd775d',
            fontWeight: 'bold',
            paddingRight: '.4rem',
            fontSize: '.8rem',
            verticalAlign: '15%',
            display: 'inline-block',
            transform: 'scale(1, 0.9)',
        }}>{t('rp')}</span>
        <span style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            display: 'inline-block',
            transform: 'scale(1, 0.9)',
        }}>{t('num', {n: rp})}</span>
        {isEstimated && <span style={{
            border: '1px solid red',
            background: '#ffeeee',
            color: 'red',
            fontSize: '0.7rem',
            borderRadius: '0.5rem',
            marginLeft: '.5rem',
            verticalAlign: '20%',
            padding: '0 0.3rem',
        }}>{t('estimated value')}</span>}
    </div>);
});

export default RpLabel;
