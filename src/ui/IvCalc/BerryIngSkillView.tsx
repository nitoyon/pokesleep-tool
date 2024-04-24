import React from 'react';
import { styled } from '@mui/system';
import { useTranslation } from 'react-i18next';

interface ViewInput {
    /** Width of the view is small or not */
    small?: boolean;

    /** Value of berry. */
    berryValue: React.ReactElement|string;
    /** Probability of berry */
    berryProb: string;
    /** Sub-value of berry. */
    berrySubValue: string;
    /** Berry info callback */
    onBerryInfoClick?: () => void;

    /** Value of ingredient. */
    ingredientValue: React.ReactElement|string;
    /** Probability of ingredient */
    ingredientProb: string;
    /** Sub-value of ingredient. */
    ingredientSubValue: string;
    /** Ingredient info callback */
    onIngredientInfoClick?: () => void;

    /** Value of skill. */
    skillValue: React.ReactElement|string;
    /** Probability of skill */
    skillProb: string;
    /** Sub-value of skill. */
    skillSubValue: string;
    /** Skill info callback */
    onSkillInfoClick?: () => void;
};

const Unit = styled('div')({
    display: 'grid',
    gridTemplateColumns: '4.5rem 1fr',
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
        '& svg': {
            width: '24px',
            height: '24px',
        }
    },
    '&.small header > div': {
        width: '4.5rem',
        textAlign: 'right',
        fontWeight: 800,
        display: 'inline-block',
        color: '#555',
    },
    '&.large header > div': {
        fontWeight: 800,
        paddingLeft: '.8rem',
        display: 'inline-block',
        color: '#555',
    },
    '& header > div > span': {
        fontSize: '0.7rem',
        paddingLeft: '.2rem',
    },
    '& footer': {
        fontSize: '0.7rem',
        color: '#666',
    },
});

/**
 * Represents Berry, Ingredient, Skill table.
 */
const BerryIngSkillView = React.memo((props: ViewInput) => {
    const { t } = useTranslation();
    const className = props.small ? "small" : "large";

    return (
        <Unit className={className}>
            <header>
                <span style={{background: '#24d76a'}}>{t('berry')}</span>
                <div>{props.berryValue}</div>
            </header>
            <footer>{t('probability')}: {props.berryProb}%</footer>
            <footer>{props.berrySubValue}</footer>

            <header>
                <span style={{background: '#fab855'}}>{t('ingredient')}</span>
                <div>{props.ingredientValue}</div>
            </header>
            <footer>{t('probability')}: {props.ingredientProb}%</footer>
            <footer>{props.ingredientSubValue}</footer>

            <header>
                <span style={{background: '#44a2fd'}}>{t('skill')}</span>
                <div>{props.skillValue}</div>
            </header>
            <footer>{t('probability')}: {props.skillProb}%</footer>
            <footer>{props.skillSubValue}</footer>
        </Unit>
    );
});

export default BerryIngSkillView;
