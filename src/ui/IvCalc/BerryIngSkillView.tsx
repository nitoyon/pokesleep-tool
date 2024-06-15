import React from 'react';
import InfoButton from './InfoButton';
import { styled } from '@mui/system';
import { useTranslation } from 'react-i18next';

interface ViewInput {
    /** Value of berry. */
    berryValue: React.ReactElement|string;
    /** Probability of berry */
    berryProb: string;
    /** Sub-value of berry. */
    berrySubValue: React.ReactElement|string;
    /** Berry info callback */
    onBerryInfoClick?: () => void;

    /** Value of ingredient. */
    ingredientValue: React.ReactElement|string;
    /** Probability of ingredient */
    ingredientProb: string;
    /** Sub-value of ingredient. */
    ingredientSubValue: React.ReactElement|string;
    /** Ingredient info callback */
    onIngredientInfoClick?: () => void;

    /** Value of skill. */
    skillValue: React.ReactElement|string;
    /** Probability of skill */
    skillProb: string;
    /** Sub-value of skill. */
    skillSubValue: React.ReactElement|string;
    /** Skill info callback */
    onSkillInfoClick?: () => void;
};

const Unit = styled('div')({
    display: 'grid',
    gridTemplateColumns: '4.8rem 1fr',
    marginLeft: '0.8rem',
    marginBottom: '.4rem',
    '& header': {
        marginTop: '.7rem',
        '&:first-of-type': {
            marginTop: 0,
        },
        gridColumn: '1 / -1',
        fontSize: '1rem',
        '& > span': {
            display: 'inline-block',
            width: '4rem',
            fontSize: '.6rem',
            padding: '.1rem 0',
            textAlign: 'center',
            color: 'white',
            borderRadius: '.6rem',
            verticalAlign: '20%',
        },
        '& > div': {
            width: '4.5rem',
            textAlign: 'right',
            fontWeight: 800,
            display: 'inline-block',
            color: '#555',
            '& > span': {
                fontSize: '0.7rem',
                paddingLeft: '.2rem',
            },
        },
        '& > button': {
            padding: 0,
            marginLeft: '6px',
            '& > svg': {
                width: '20px',
                height: '20px',
                color: '#bbb',
            },
        },
    },
    '& footer': {
        fontSize: '0.7rem',
        color: '#666',
        '& > svg': {
            verticalAlign: 'baseline',
            paddingLeft: '.5rem',
            width: '.8rem',
            height: '.8rem',
            paddingRight: '0.2rem',
            '&:first-of-type': {
                paddingLeft: 0,
            },
            '&.MuiSvgIcon-root': {
                width: '1rem',
                height: '1rem',
                verticalAlign: 'top',
                paddingRight: 0,
            },
        },
    },
});

/**
 * Represents Berry, Ingredient, Skill table.
 */
const BerryIngSkillView = React.memo((props: ViewInput) => {
    const { t } = useTranslation();

    return (
        <Unit>
            <header>
                <span style={{background: '#24d76a'}}>{t('berry')}</span>
                <div>{props.berryValue}</div>
                {props.onBerryInfoClick !== undefined &&
                <InfoButton onClick={props.onBerryInfoClick}/>}
            </header>
            <footer>{t('probability')}: {props.berryProb}%</footer>
            <footer>{props.berrySubValue}</footer>

            <header>
                <span style={{background: '#fab855'}}>{t('ingredient')}</span>
                <div>{props.ingredientValue}</div>
                {props.onIngredientInfoClick !== undefined &&
                <InfoButton onClick={props.onIngredientInfoClick}/>}
            </header>
            <footer>{t('probability')}: {props.ingredientProb}%</footer>
            <footer>{props.ingredientSubValue}</footer>

            <header>
                <span style={{background: '#44a2fd'}}>{t('skill')}</span>
                <div>{props.skillValue}</div>
                {props.onSkillInfoClick !== undefined &&
                <InfoButton onClick={props.onSkillInfoClick}/>}
            </header>
            <footer>{t('probability')}: {props.skillProb}%</footer>
            <footer>{props.skillSubValue}</footer>
        </Unit>
    );
});

export default BerryIngSkillView;
