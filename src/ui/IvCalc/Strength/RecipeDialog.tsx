import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, Typography,
    FormControl, Select, SelectChangeEvent, MenuItem } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import { StrengthParameter } from '../../../util/PokemonStrength';
import { IvAction } from '../IvState';

const RecipeDialog = React.memo(({open, parameter, dispatch, onClose}: {
    open: boolean,
    parameter: StrengthParameter,
    dispatch: React.Dispatch<IvAction>,
    onClose: () => void,
}) => {
    const { t } = useTranslation();

    const onChange = React.useCallback((value: StrengthParameter) => {
        dispatch({type: "changeParameter", payload: {parameter: value}});
    }, [dispatch]);

    const onRecipeBonusChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...parameter, recipeBonus: parseInt(e.target.value)});
    }, [onChange, parameter]);

    const onRecipeLevelChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...parameter, recipeLevel: parseInt(e.target.value) as 1|10|20|30|40|50|55});
    }, [onChange, parameter]);

    return <Dialog open={open} onClose={onClose}>
        <DialogContent>
            <section style={{marginBottom: '1rem'}}>
                <label>{t('recipe bonus')}:</label>
                <FormControl size="small">
                <Select variant="standard" value={parameter.recipeBonus.toString()}
                    onChange={onRecipeBonusChange}>
                    <MenuItem value={0}>0% <small style={{paddingLeft: '0.3rem'}}>({t('mixed recipe')})</small></MenuItem>
                    <MenuItem value={19}>19% <small style={{paddingLeft: '0.3rem'}}>(7{t('range separator')}16 {t('ingredients unit')})</small></MenuItem>
                    <MenuItem value={20}>20% <small style={{paddingLeft: '0.3rem'}}>(20{t('range separator')}22 {t('ingredients unit')})</small></MenuItem>
                    <MenuItem value={21}>21% <small style={{paddingLeft: '0.3rem'}}>(23{t('range separator')}26 {t('ingredients unit')})</small></MenuItem>
                    <MenuItem value={25}>25% <small style={{paddingLeft: '0.3rem'}}>(17{t('range separator')}35 {t('ingredients unit')})</small></MenuItem>
                    <MenuItem value={35}>35% <small style={{paddingLeft: '0.3rem'}}>(35{t('range separator')}56 {t('ingredients unit')})</small></MenuItem>
                    <MenuItem value={48}>48% <small style={{paddingLeft: '0.3rem'}}>(49{t('range separator')}77 {t('ingredients unit')})</small></MenuItem>
                    <MenuItem value={61}>61% <small style={{paddingLeft: '0.3rem'}}>(78{t('range separator')}102 {t('ingredients unit')})</small></MenuItem>
                    <MenuItem value={78}>78% <small style={{paddingLeft: '0.3rem'}}>(103{t('range separator')}115 {t('ingredients unit')})</small></MenuItem>
                </Select></FormControl>
            </section>
            <section style={{marginBottom: '1.5rem'}}>
                <label>{t('average recipe level')}:</label>
                <Select variant="standard" value={parameter.recipeLevel.toString()}
                    onChange={onRecipeLevelChange}>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                    <MenuItem value={30}>30</MenuItem>
                    <MenuItem value={40}>40</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={55}>55</MenuItem>
                    <MenuItem value={60}>60</MenuItem>
                    <MenuItem value={65}>65</MenuItem>
                </Select>
            </section>
            <Typography variant="body2" sx={{
                marginBottom: "16px"
            }}>
                <Trans i18nKey="recipe bonus help"
                    components={{
                        raenonx: <a href={t('recipe bonus list')}>raenonx</a>,
                    }}/>
            </Typography>
            <Typography variant="body2">{t('recipe strength help')}</Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </Dialog>;
});

export default RecipeDialog;
