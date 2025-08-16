import React from 'react';
import { styled } from '@mui/system';
import { Button, Collapse, Dialog, DialogActions, DialogTitle, DialogContent, FormControl, MenuItem,
    Select, SelectChangeEvent, Snackbar, Switch, Typography,
    ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { IvAction } from '../IvState';
import AreaBonusControl from './AreaBonusControl';
import InfoButton from '../InfoButton';
import FavoriteBerrySelect from './FavoriteBerrySelect';
import ResearchAreaSelect from './ResearchAreaSelect';
import EventConfigDialog from './EventConfigDialog';
import { isExpertField } from '../../../data/fields';
import { getActiveHelpBonus } from '../../../data/events';
import {
    createStrengthParameter, StrengthParameter, whistlePeriod,
} from '../../../util/PokemonStrength';
import { useTranslation, Trans } from 'react-i18next';

type PeriodType = "1hour"|"3hours"|"8hours"|"1day"|"1week"|"whistle";

const StyledSettingForm = styled('div')({
    padding: '0 1rem',
    marginBottom: '10rem',
    '& section': {
        margin: '0.2rem 0',
        fontSize: '.9rem',
        display: 'flex',
        flex: '0 auto',
        '&.mt': {
            marginTop: '1rem',
        },
        '& > label': {
            marginRight: 'auto',
            marginTop: 0,
            textWrap: 'nowrap',
        },
        '& > span > button': {
            marginRight: 0,
        },
        '& > .MuiInput-underline': {
            fontSize: '0.9rem',
        },
        '& div.MuiToggleButtonGroup-root > button': {
            fontSize: '0.75rem',
            padding: '0.5rem 0.2rem',
            lineHeight: 1.1,
            maxWidth: '7rem',
        },
    },
    '& > button': {
        marginLeft: '-.4rem',
    },
});

const StrengthSettingForm = React.memo(({dispatch, value, hasHelpingBonus}: {
    dispatch: React.Dispatch<IvAction>,
    value: StrengthParameter,
    hasHelpingBonus: boolean,
}) => {
    const { t } = useTranslation();
    const [recipeBonusHelpOpen, setRecipeBonusHelpOpen] = React.useState(false);
    const [eventDetailOpen, setEventDetailOpen] = React.useState(false);
    const [initializeConfirmOpen, setInitializeConfirmOpen] = React.useState(false);

    const onRecipeBonusInfoClick = React.useCallback(() => {
        setRecipeBonusHelpOpen(true);
    }, []);
    const onRecipeBonusHelpClose = React.useCallback(() => {
        setRecipeBonusHelpOpen(false);
    }, []);

    const onChange = React.useCallback((value: StrengthParameter) => {
        dispatch({type: "changeParameter", payload: {parameter: value}});
    }, [dispatch]);

    const onPeriodChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, period: parseInt(e.target.value as PeriodType, 10)});
    }, [onChange, value]);
    const onFieldBonusChange = React.useCallback((fieldBonus: number) => {
        onChange({...value, fieldBonus});
    }, [onChange, value]);
    const onHelpBonusCountChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, helpBonusCount: parseInt(e.target.value, 10) as 0|1|2|3|4});
    }, [onChange, value]);
    const onGoodCampTicketChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({...value, isGoodCampTicketSet: e.target.checked});
    }, [onChange, value]);
    const onLevelChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, level: parseInt(e.target.value, 10) as 0|10|25|30|50|55|60|75|100})
    }, [onChange, value])
    const onEvolvedChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({...value, evolved: e.target.checked});
    }, [onChange, value]);
    const onMaxSkillLevelChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({...value, maxSkillLevel: e.target.checked});
    }, [onChange, value]);
    const onEventChange = React.useCallback((e: any, val: string|null) => {
        if (val === null) {
            return;
        }
        if (val === "advanced") {
            val = "custom";
        }
        onChange({...value, event: val});
    }, [onChange, value]);
    const onEventDetailClick = React.useCallback(() => {
        setEventDetailOpen(true);
    }, []);
    const onEventDetailClose = React.useCallback(() => {
        setEventDetailOpen(false);
    }, []);
    const onTapFrequencyChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, tapFrequency: e.target.value as "always"|"none"});
    }, [onChange, value]);
    const onTapFrequencyAsleepChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, tapFrequencyAsleep: e.target.value as "always"|"none"});
    }, [onChange, value]);
    const onEditEnergyClick = React.useCallback(() => {
        dispatch({type: 'openEnergyDialog'});
    }, [dispatch]);
    const onRecipeBonusChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, recipeBonus: parseInt(e.target.value)});
    }, [onChange, value]);
    const onRecipeLevelChange = React.useCallback((e: SelectChangeEvent) => {
        onChange({...value, recipeLevel: parseInt(e.target.value) as 1|10|20|30|40|50|55});
    }, [onChange, value]);
    const onInitializeClick = React.useCallback(() => {
        setInitializeConfirmOpen(true);
    }, []);
    const onInitializeConfirmClose = React.useCallback(() => {
        setInitializeConfirmOpen(false);
    }, []);

    const scheduledEvents = getActiveHelpBonus(new Date())
        .map(x => x.name)
        .reverse();
    let prevEventName = "";
    const eventToggles = ['none', ...scheduledEvents, 'advanced'].map(x => {
        let curEventName = t(`events.${x}`);
        if (prevEventName.replace(/\(.*/, '') === curEventName.replace(/\(.*/, '')) {
            curEventName = curEventName
                .replace(/.*\(/, '')
                .replace(')', '');
        }
        prevEventName = curEventName;
        return <ToggleButton key={x} value={x} style={{ textTransform: 'none' }}>{curEventName}</ToggleButton>
    });
    const eventName = ['none', ...scheduledEvents]
        .includes(value.event) ? value.event : 'advanced';

    const isNotWhistle = (value.period !== whistlePeriod);
    return <StyledSettingForm>
        <section>
            <label>{t('period')}:</label>
            <Select variant="standard" onChange={onPeriodChange} value={value.period.toString()}>
                <MenuItem value={1}>{t('1hour')}</MenuItem>
                <MenuItem value={3}>{t('3hours')}</MenuItem>
                <MenuItem value={8}>{t('8hours')}</MenuItem>
                <MenuItem value={24}>{t('1day')}</MenuItem>
                <MenuItem value={168}>{t('1week')}</MenuItem>
                <MenuItem value={whistlePeriod}>{t('whistle')}</MenuItem>
            </Select>
        </section>
        <section>
            <label>{t('research area')}:</label>
            <ResearchAreaSelect value={value} fontSize="0.9rem"
                onChange={onChange}/>
        </section>
        <Collapse in={value.fieldIndex === 0}>
            <FavoriteBerrySelect value={value} onChange={onChange}/>
        </Collapse>
        <Collapse in={isExpertField(value.fieldIndex)}>
            <div style={{padding: '0 0 0.7rem 1rem'}}>
                <FavoriteBerrySelect value={value} onChange={onChange}/>
            </div>
        </Collapse>
        <section>
            <label>{t('area bonus')}:</label>
            <AreaBonusControl value={value.fieldBonus}
                onChange={onFieldBonusChange}/>
        </section>
        <Collapse in={isNotWhistle}>
            <section>
                <label>{t('good camp ticket')}:</label>
                <Switch checked={value.isGoodCampTicketSet} onChange={onGoodCampTicketChange}/>
            </section>
        </Collapse>
        <section className="mt">
            <label>{t('event')}:</label>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                <ToggleButtonGroup size="small" exclusive
                    value={eventName} onChange={onEventChange}>
                    {eventToggles}
                </ToggleButtonGroup>
                <Collapse in={eventName === "advanced"}>
                    <Button onClick={onEventDetailClick}>{t('configure event details')}</Button>
                </Collapse>
            </div>
        </section>
        <section className="mt">
            <label>{t('level')}:</label>
            <Select variant="standard" onChange={onLevelChange} value={value.level.toString()}>
                <MenuItem value={0}>{t('current level')}</MenuItem>
                <MenuItem value={10}>Lv. 10</MenuItem>
                <MenuItem value={25}>Lv. 25</MenuItem>
                <MenuItem value={30}>Lv. 30</MenuItem>
                <MenuItem value={50}>Lv. 50</MenuItem>
                <MenuItem value={60}>Lv. 60</MenuItem>
                <MenuItem value={65}>Lv. 65</MenuItem>
                <MenuItem value={75}>Lv. 75</MenuItem>
                <MenuItem value={100}>Lv. 100</MenuItem>
            </Select>
        </section>
        <section>
            <label>{t('calc with evolved')}:</label>
            <Switch checked={value.evolved} onChange={onEvolvedChange}/>
        </section>
        <section>
            <label>{t('calc with max skill level')}:</label>
            <Switch checked={value.maxSkillLevel} onChange={onMaxSkillLevelChange}/>
        </section>
        <section className="mt">
            <label>{t('helping bonus')}:</label>
            <Select variant="standard" value={value.helpBonusCount.toString()}
                onChange={onHelpBonusCountChange}>
                <MenuItem value={0}>{hasHelpingBonus ? '×1' : t('none')}</MenuItem>
                <MenuItem value={1}>{hasHelpingBonus ? '×2' : '×1'}</MenuItem>
                <MenuItem value={2}>{hasHelpingBonus ? '×3' : '×2'}</MenuItem>
                <MenuItem value={3}>{hasHelpingBonus ? '×4' : '×3'}</MenuItem>
                <MenuItem value={4}>{hasHelpingBonus ? '×5' : '×4'}</MenuItem>
            </Select>
        </section>
        <Collapse in={isNotWhistle}>
            <section>
                <label>{t('tap frequency')} ({t('awake')}):</label>
                <Select variant="standard" value={value.tapFrequency}
                    onChange={onTapFrequencyChange}>
                    <MenuItem value="always">{t('every minute')}</MenuItem>
                    <MenuItem value="none">{t('none')}</MenuItem>
                </Select>
            </section>
            <section>
                <label>{t('tap frequency')} ({t('asleep')}):</label>
                {value.tapFrequency === "none" ?
                    <span style={{fontSize: '0.9rem'}}>{t('none')}</span> :
                    <Select variant="standard" value={value.tapFrequencyAsleep}
                        onChange={onTapFrequencyAsleepChange}>
                        <MenuItem value="always">{t('every minute')}</MenuItem>
                        <MenuItem value="none">{t('none')}</MenuItem>
                    </Select>}
            </section>
            <section className="mt">
                <label>{t('energy')}:</label>
                <Button onClick={onEditEnergyClick}>{t('edit')}</Button>
            </section>
        </Collapse>
        <section className="mt">
            <label>{t('recipe bonus')}:<InfoButton onClick={onRecipeBonusInfoClick}/></label>
            <FormControl size="small">
            <Select variant="standard" value={value.recipeBonus.toString()}
                onChange={onRecipeBonusChange}>
                <MenuItem value={0}>0% <small style={{paddingLeft: '0.3rem'}}>({t('mixed recipe')})</small></MenuItem>
                <MenuItem value={19}>19% <small style={{paddingLeft: '0.3rem'}}>(7{t('range separator')}16 {t('ingredients unit')})</small></MenuItem>
                <MenuItem value={20}>20% <small style={{paddingLeft: '0.3rem'}}>(20{t('range separator')}22 {t('ingredients unit')})</small></MenuItem>
                <MenuItem value={21}>21% <small style={{paddingLeft: '0.3rem'}}>(23{t('range separator')}26 {t('ingredients unit')})</small></MenuItem>
                <MenuItem value={25}>25% <small style={{paddingLeft: '0.3rem'}}>(17{t('range separator')}35 {t('ingredients unit')})</small></MenuItem>
                <MenuItem value={35}>35% <small style={{paddingLeft: '0.3rem'}}>(35{t('range separator')}56 {t('ingredients unit')})</small></MenuItem>
                <MenuItem value={48}>48% <small style={{paddingLeft: '0.3rem'}}>(49{t('range separator')}77 {t('ingredients unit')})</small></MenuItem>
                <MenuItem value={61}>61% <small style={{paddingLeft: '0.3rem'}}>(87{t('range separator')}102 {t('ingredients unit')})</small></MenuItem>
            </Select></FormControl>
        </section>
        <section>
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
                <MenuItem value={60}>60</MenuItem>
            </Select>
        </section>
        <section className="mt">
            <Button onClick={onInitializeClick} variant="outlined">{t('initialize all parameters')}</Button>
        </section>
        <InitializeConfirmDialog open={initializeConfirmOpen} onClose={onInitializeConfirmClose}
            dispatch={dispatch}/>
        <RecipeBonusHelpDialog open={recipeBonusHelpOpen} onClose={onRecipeBonusHelpClose}/>
        <EventConfigDialog open={eventDetailOpen} onClose={onEventDetailClose}
            value={value} onChange={onChange}/>
    </StyledSettingForm>;
});

const RecipeBonusHelpDialog = React.memo(({open, onClose}: {
    open: boolean,
    onClose: () => void,
}) => {
    const { t } = useTranslation();

    return <Dialog open={open} onClose={onClose}>
        <DialogContent>
            <Typography paragraph>
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

const InitializeConfirmDialog = React.memo(({ dispatch, open, onClose }: {
    dispatch: React.Dispatch<IvAction>,
    open: boolean,
    onClose: () => void }
) => {
    const [snackBarVisible, setSnackBarVisible] = React.useState(false);
    const { t } = useTranslation();

    const onInitialize = React.useCallback(() => {
        dispatch({type: "changeParameter", payload: {
            parameter: createStrengthParameter({}),
        }});
        setSnackBarVisible(true);
        onClose();
    }, [dispatch, onClose]);
    const onSnackbarClose = React.useCallback(() => {
        setSnackBarVisible(false);
    }, []);

    return (<>
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t('initialize all parameters')}</DialogTitle>
            <DialogContent>
                <p style={{ fontSize: "0.9rem", margin: 0 }}>{t("initialize all parameters message")}</p>
            </DialogContent>
            <DialogActions>
                <Button onClick={onInitialize} color="error">{t("reset")}</Button>
                <Button onClick={onClose}>{t("cancel")}</Button>
            </DialogActions>
        </Dialog>
        <Snackbar open={snackBarVisible}
            autoHideDuration={2000} onClose={onSnackbarClose}
            message={t("initialized all parameters")}/>
    </>);
});

export default StrengthSettingForm;
