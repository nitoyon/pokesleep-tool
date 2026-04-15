import React from 'react';
import { round1, formatWithComma } from '../../../util/NumberUtil';
import PokemonStrength, { StrengthResult } from '../../../util/PokemonStrength';
import InfoButton from '../InfoButton';
import { IvAction } from '../IvState';
import BerryStrengthDialog from './BerryStrengthDialog';
import { StyledInfoDialog } from './StrengthBerryIngSkillView';
import TapFrequencyControl from './TapFrequencyControl';
import { NoTap } from '../../../util/Energy';
import { Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useTranslation } from 'react-i18next';

const BerryHelpDialog = React.memo(({open, onClose, dispatch, strength, result}: {
    open: boolean,
    onClose: () => void,
    dispatch: React.Dispatch<IvAction>,
    strength: PokemonStrength,
    result: StrengthResult,
}) => {
    const { t } = useTranslation();
    const [berryStrengthOpen, setBerryStrengthOpen] = React.useState(false);
    const onBerryStrengthInfoClick = React.useCallback(() => {
        setBerryStrengthOpen(true);
    }, []);
    const onBerryStrengthInfoClose = React.useCallback(() => {
        setBerryStrengthOpen(false);
    }, []);

    const parameter = strength.parameter;
    const onTapFrequencyAwakeChange = React.useCallback((tapFrequencyAwake: number) => {
        dispatch({type: "changeParameter", payload: {parameter: {...parameter, tapFrequencyAwake}}});
    }, [dispatch, parameter]);
    const onTapFrequencyAsleepChange = React.useCallback((tapFrequencyAsleep: number) => {
        dispatch({type: "changeParameter", payload: {parameter: {...parameter, tapFrequencyAsleep}}});
    }, [dispatch, parameter]);

    if (!open) {
        return <></>;
    }

    const param = strength.parameter;
    const berryStrength = Math.ceil(result.berryStrength * strength.berryStrengthBonus);
    const hasBerryCountBonus = (result.bonus.berry > 0);
    const berryCountWithBonus = result.berryCountPerNormalHelp;
    const helpCount = hasBerryCountBonus ? 
        round1(result.total.normal * result.berryRate) :
        round1(result.berryHelpCount);
    return <StyledInfoDialog open={open} onClose={onClose}>
        <DialogTitle>
            <article>
                <LocalFireDepartmentIcon sx={{color: "#ff944b"}}/>
                {formatWithComma(Math.round(result.berryTotalStrength))}
            </article>
            <footer>
                <span className="box box1">{berryStrength}</span><> × </>
                <span className="box box2">{berryCountWithBonus}</span><> × </>
                <span className="box box3">{helpCount}</span>
                {hasBerryCountBonus && <>
                    <br/>
                    <> + </>
                    <span className="box box1">{berryStrength}</span><> × </>
                    <span className="box box2">{result.berryCountPerSneakySnacking}</span><> × </>
                    <span className="box box3">{round1(result.total.sneakySnacking)}</span>
                </>}
            </footer>
        </DialogTitle>
        <DialogContent>
            <article>
                <div><span className="box box1">{berryStrength}</span></div>
                <span>{t('actual berry strength')}<InfoButton onClick={onBerryStrengthInfoClick}/></span>
                <div><span className="box box2">{berryCountWithBonus}</span></div>
                <span>{t('berry count')}</span>
                <div><span className="box box3">{helpCount}</span></div>
                <span>{t('berry help count')}
                    <ul className="detail">
                        <li>
                            <strong>{round1(result.total.normal * result.berryRate)}</strong>{t('times unit')}: {t('berry picking count')}
                            <footer>
                                {round1(result.total.normal)}
                                <small> ({t('normal help count')})</small>
                                <> × </>
                                {round1(result.berryRate * 100)}%
                                <small> ({t('berry rate')})</small>
                            </footer>
                        </li>
                        <li>
                            <strong>{round1(result.total.sneakySnacking)}</strong>{t('times unit')}: {t('sneaky snacking')}
                            <footer>
                                {t('awake')}: {round1(result.awake.sneakySnacking)}{t('times unit')}<br/>
                                {t('asleep')}: {round1(result.asleep.sneakySnacking)}{t('times unit')}<br/>
                            </footer>
                        </li>
                    </ul>
                </span>
            </article>
            {parameter.period > 0 && <>
                <section style={{marginTop: '1.8rem'}}>
                    <label>{t('tap frequency')} ({t('awake')}):</label>
                    <TapFrequencyControl max={10} value={parameter.tapFrequencyAwake}
                        onChange={onTapFrequencyAwakeChange}/>
                </section>
                <section>
                    <label>{t('tap frequency')} ({t('asleep')}):</label>
                    {parameter.tapFrequencyAwake === NoTap ?
                        <span style={{fontSize: '0.9rem'}}>{t('none')}</span> :
                        <TapFrequencyControl max={8} value={parameter.tapFrequencyAsleep}
                            onChange={onTapFrequencyAsleepChange}/>
                    }
                </section>
            </>}
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
        <BerryStrengthDialog open={berryStrengthOpen} onClose={onBerryStrengthInfoClose}
            iv={strength.pokemonIv} fieldBonus={param.fieldBonus}
            berryBonus={strength.berryStrengthBonus}/>
    </StyledInfoDialog>;
});

export default BerryHelpDialog;
