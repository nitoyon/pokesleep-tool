import React from 'react';
import { styled } from '@mui/system';
import { Button, FormControl, MenuItem, Select, SelectChangeEvent, Switch } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { PeriodType } from './StrengthView';
import { CalculateParameter } from '../../util/PokemonStrength';
import { useTranslation } from 'react-i18next';

const StyledSettingForm = styled('div')({
    padding: '.4rem 1rem 0',
    margin: '1rem auto',
    width: '17rem',
    border: '1px solid #ccc',
    borderRadius: '1rem',
    background: '#f3f5f0',
    '& > div': {
        fontSize: '.9rem',
        display: 'flex',
        flex: '0 auto',
        alignItems: 'center',
        '& > label': {
            marginRight: 'auto',
        },
    },
    '& > button': {
        marginLeft: '-.4rem',
    }
});

const AnnimatedExpandMoreIcon = styled((props: {expand: boolean}) => {
    const { expand, ...other } = props;
    return <ExpandMoreIcon {...other} />;
})(({ expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: 'transform 200ms ease-in-out',
}));
 
const StrengthSettingForm = React.memo(({onChange, value, hasHelpingBonus}: {
    onChange: (value: CalculateParameter) => void,
    value: CalculateParameter,
    hasHelpingBonus: boolean,
}) => {
    const { t } = useTranslation();
    const [detail, setDetail] = React.useState(false);

    const onPeriodChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, period: parseInt(e.target.value as PeriodType, 10) as 24|168|3});
    }, [onChange, value]);
    const onFieldBonusChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, fieldBonus: parseInt(e.target.value, 10)});
    }, [onChange, value]);
    const onFavoriteChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({...value, favorite: e.target.checked});
    }, [onChange, value]);
    const onHelpBonusCountChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, helpBonusCount: parseInt(e.target.value, 10) as 0|1|2|3|4});
    }, [onChange, value]);
    const onGoodCampTicketChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({...value, isGoodCampTicketSet: e.target.checked});
    }, [onChange, value]);
    const onTapFrequencyChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, tapFrequency: e.target.value as "always"|"none"});
    }, [onChange, value]);
    const onAverageEfficiencyChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, averageEfficiency: parseFloat(e.target.value)});
    }, [onChange, value]);
    const onRecipeBonusChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, recipeBonus: parseInt(e.target.value)});
    }, [onChange, value]);
    const onRecipeLevelChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, recipeLevel: parseInt(e.target.value) as 1|10|20|30|40|50|55});
    }, [onChange, value]);

    const onDetailClick = React.useCallback(() => {
        setDetail(!detail);
    }, [setDetail, detail]);

    const isNotWhistle = (value.period !== 3);
    return <StyledSettingForm>
        <div>
            <label>{t('period')}:</label>
            <Select variant="standard" onChange={onPeriodChange} value={value.period.toString()}>
                <MenuItem value={24}>{t('1day')}</MenuItem>
                <MenuItem value={168}>{t('1week')}</MenuItem>
                <MenuItem value={3}>{t('whistle')}</MenuItem>
            </Select>
        </div>
        <div>
            <label>{t('field bonus')}:</label>
            <Select variant="standard" value={value.fieldBonus.toString()}
                onChange={onFieldBonusChange}>
                <MenuItem value={0}>0%</MenuItem>
                <MenuItem value={5}>5%</MenuItem>
                <MenuItem value={10}>10%</MenuItem>
                <MenuItem value={15}>15%</MenuItem>
                <MenuItem value={20}>20%</MenuItem>
                <MenuItem value={25}>25%</MenuItem>
                <MenuItem value={30}>30%</MenuItem>
                <MenuItem value={35}>35%</MenuItem>
                <MenuItem value={40}>40%</MenuItem>
                <MenuItem value={45}>45%</MenuItem>
                <MenuItem value={40}>40%</MenuItem>
                <MenuItem value={45}>45%</MenuItem>
                <MenuItem value={50}>50%</MenuItem>
                <MenuItem value={55}>55%</MenuItem>
                <MenuItem value={60}>60%</MenuItem>
            </Select>
        </div>
        <div>
            <label>{t('favorite berry')}:</label>
            <Switch checked={value.favorite} onChange={onFavoriteChange}/>
        </div>
        {isNotWhistle && <div>
            <label>{t('good camp ticket')}:</label>
            <Switch checked={value.isGoodCampTicketSet} onChange={onGoodCampTicketChange}/>
        </div>}
        {detail && <div>
            <label>{t('helping bonus')}:</label>
            <Select variant="standard" value={value.helpBonusCount.toString()}
                onChange={onHelpBonusCountChange}>
                {!hasHelpingBonus && <MenuItem value={0}>{t('none')}</MenuItem>}
                <MenuItem value={1}>×1</MenuItem>
                <MenuItem value={2}>×2</MenuItem>
                <MenuItem value={3}>×3</MenuItem>
                <MenuItem value={4}>×4</MenuItem>
                {hasHelpingBonus && <MenuItem value={5}>×5</MenuItem>}
            </Select>
        </div>}
        {isNotWhistle && detail && <div>
            <label>{t('tap frequency')}:</label>
            <Select variant="standard" value={value.tapFrequency}
                onChange={onTapFrequencyChange}>
                <MenuItem value="always">{t('every minute')}</MenuItem>
                <MenuItem value="none">{t('none')}</MenuItem>
            </Select>
        </div>}
        {isNotWhistle && detail && <div>
            <label>{t('energy')}:</label>
            <Select variant="standard" value={value.averageEfficiency.toString()}
                onChange={onAverageEfficiencyChange}>
                <MenuItem value={1.4398}>{t('no healing')}</MenuItem>
                <MenuItem value={1.5412}>18 × 1 {t('healing')}</MenuItem>
                <MenuItem value={1.6765}>18 × 2 {t('healing')}</MenuItem>
                <MenuItem value={1.8452}>18 × 3 {t('healing')}</MenuItem>
                <MenuItem value={2.0274}>18 × 4 {t('healing')}</MenuItem>
                <MenuItem value={2.1214}>18 × 5 {t('healing')}</MenuItem>
                <MenuItem value={2.1890}>18 × 6 {t('healing')}</MenuItem>
                <MenuItem value={2.2222}>{t('always 81%+')}</MenuItem>
            </Select>
        </div>}
        {detail && <div>
            <label>{t('recipe range (the number of ingredients)')}:</label>
            <FormControl size="small">
            <Select variant="standard" value={value.recipeBonus.toString()}
                onChange={onRecipeBonusChange}>
                <MenuItem value={0}>{t('mixed recipe')}</MenuItem>
                <MenuItem value={6}>7{t('range separator')}9 {t('ingredients unit')}</MenuItem>
                <MenuItem value={11}>14{t('range separator')}16 {t('ingredients unit')}</MenuItem>
                <MenuItem value={17}>22{t('range separator')}26 {t('ingredients unit')}</MenuItem>
                <MenuItem value={25}>30{t('range separator')}38 {t('ingredients unit')}</MenuItem>
                <MenuItem value={35}>53{t('range separator')}55 {t('ingredients unit')}</MenuItem>
                <MenuItem value={48}>62{t('range separator')}77 {t('ingredients unit')}</MenuItem>
            </Select></FormControl>
        </div>}
        {detail && <div>
            <label>{t('average recipe level')}:</label>
            <Select variant="standard" value={value.recipeLevel.toString()}
                onChange={onRecipeLevelChange}>
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={40}>40</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={55}>55</MenuItem>
            </Select>
        </div>}
        <div>
            <label/>
            <Button startIcon={<AnnimatedExpandMoreIcon expand={detail}/>} onClick={onDetailClick}>{t('details')}</Button>
        </div>
    </StyledSettingForm>;
});

export default StrengthSettingForm;
