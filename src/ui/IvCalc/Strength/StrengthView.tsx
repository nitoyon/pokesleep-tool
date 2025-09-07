import React from 'react';
import { styled } from '@mui/system';
import IvState, { IvAction } from '../IvState';
import AreaControlDialog from './AreaControlDialog';
import EventConfigDialog from './EventConfigDialog';
import StrengthBerryIngSkillView from './StrengthBerryIngSkillView';
import PeriodSelect from './PeriodSelect';
import SelectEx from '../../common/SelectEx';
import TextLikeButton from '../../common/TextLikeButton';
import { getActiveHelpBonus } from '../../../data/events';
import { isExpertField } from '../../../data/fields';
import {
    allFavoriteFieldIndex, noFavoriteFieldIndex, StrengthParameter, whistlePeriod,
} from '../../../util/PokemonStrength';
import { Button, Collapse, IconButton, MenuItem } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';

const StrengthView = React.memo(({state, dispatch}: {
    state: IvState,
    dispatch: React.Dispatch<IvAction>,
}) => {
    const { t } = useTranslation();
    const [areaDialogOpen, setAreaDialogOpen] = React.useState(false);
    const [eventConfigOpen, setEventConfigOpen] = React.useState(false);
    const pokemonIv = state.pokemonIv;
    const parameter = state.parameter;
    const lowerTabIndex = state.lowerTabIndex;

    const onEditClick = React.useCallback(() => {
        dispatch({type: "changeLowerTab", payload: {index: 2}});
    }, [dispatch]);

    const onAreaClick = React.useCallback(() => {
        setAreaDialogOpen(true);
    }, []);
    const onAreaDialogClose = React.useCallback(() => {
        setAreaDialogOpen(false);
    }, []);

    const onParameterChange = React.useCallback((parameter: StrengthParameter) => {
        dispatch({type: "changeParameter", payload: { parameter }});
    }, [dispatch]);

    const onMaxSkillLevelClick = React.useCallback(() => {
        dispatch({type: "changeParameter", payload: { parameter: {
            ...parameter, maxSkillLevel: false,
        }}});
    }, [dispatch, parameter]);

    const onCampTicketClick = React.useCallback(() => {
        dispatch({type: "changeParameter", payload: { parameter: {
            ...parameter,
            isGoodCampTicketSet: !parameter.isGoodCampTicketSet,
        }}});
    }, [dispatch, parameter]);

    const onEventChange = React.useCallback((value: string) => {
        if (value === 'advanced') {
            value = 'custom';
        }
        dispatch({type: "changeParameter", payload: { parameter: {
            ...parameter,
            event: value,
        }}});
    }, [dispatch, parameter]);

    const onEventConfigClick = React.useCallback(() => {
        setEventConfigOpen(true);
    }, []);
    const onEventConfigClose = React.useCallback(() => {
        setEventConfigOpen(false);
    }, []);

    let area: React.ReactNode, fieldBonus: React.ReactNode;
    if (parameter.fieldIndex === allFavoriteFieldIndex) {
        area = t('favorite berry') + ': ' + t('all');
    }
    else if (parameter.fieldIndex === noFavoriteFieldIndex) {
        area = t('favorite berry') + ': ' + t('none');
    }
    else if (parameter.fieldIndex === 0) {
        area = parameter
            .favoriteType.map(x => t(`types.${x}`))
            .join(t('text separator'));
    }
    else if (isExpertField(parameter.fieldIndex)) {
        area = <>
            {t(`types.${parameter.favoriteType[0]}`)}
            <small> ({t('main')})</small>
            {t('text separator')}
            {t(`types.${parameter.favoriteType[1]}`)}
            {t('text separator')}
            {t(`types.${parameter.favoriteType[2]}`)}
        </>;
    }
    else {
        area = t(`area.${parameter.fieldIndex}`);
    }
    fieldBonus = <small> ({parameter.fieldBonus}%)</small>;

    const activeEvents = getActiveHelpBonus(new Date())
        .map(x => x.name)
        .reverse();
    const isEventScheduled = activeEvents.length > 0 || parameter.event !== 'none';
    const eventMenuItems = ['none', ...activeEvents, 'custom'].map(x => {
        let name = x === 'none' ? t('no event') :
            x === 'custom' ? (t('event') + ': ' + t('events.advanced')) :
            t(`events.${x}`);
        return <MenuItem key={x} value={x} dense
            style={{ textTransform: 'none' }}>{name}</MenuItem>
    });

    return (<div>
        <StrengthBerryIngSkillView pokemonIv={pokemonIv} settings={parameter}
            energyDialogOpen={state.energyDialogOpen} dispatch={dispatch}/>
        <Collapse in={lowerTabIndex !== 2}>
            <StrengthParameterPreview>
                <ul>
                    <li><TextLikeButton onClick={onAreaClick}>
                        {area}{fieldBonus}
                    </TextLikeButton></li>
                    <li><PeriodSelect dispatch={dispatch} value={parameter}/></li>
                    {parameter.level !== 0 && <li><strong>Lv.{parameter.level}</strong></li>}
                    {parameter.maxSkillLevel && <li>
                        <TextLikeButton onClick={onMaxSkillLevelClick}><strong>{t('calc with max skill level (short)')}</strong></TextLikeButton>
                    </li>}
                    {parameter.period !== whistlePeriod && <li>
                        <>{t('good camp ticket (short)')}: </>
                        <TextLikeButton onClick={onCampTicketClick} style={{width: '2rem'}}>{t(parameter.isGoodCampTicketSet ? 'on' : 'off')}</TextLikeButton>
                    </li>}
                    {isEventScheduled && <li>
                        <SelectEx value={parameter.event} onChange={onEventChange}>
                            {eventMenuItems}
                        </SelectEx>
                        {parameter.event === 'custom' && <IconButton size="small" style={{padding: '2px'}}
                            onClick={onEventConfigClick}>
                            <SettingsIcon/>
                        </IconButton>}
                    </li>}
                </ul>
                <Button onClick={onEditClick} size="small">{t('edit')}</Button>
            </StrengthParameterPreview>
        </Collapse>
        <AreaControlDialog open={areaDialogOpen} onClose={onAreaDialogClose}
            value={state.parameter} onChange={onParameterChange}/>
        <EventConfigDialog open={eventConfigOpen} onClose={onEventConfigClose}
            value={state.parameter} onChange={onParameterChange}/>
    </div>);
});

const StrengthParameterPreview = styled('div')({
    marginTop: '0.2rem',
    padding: '.4rem .6rem',
    border: '1px solid #ccc',
    borderRadius: '1rem',
    background: '#f3f5f0',
    fontSize: '0.8rem',
    display: 'flex',
    '& > ul': {
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        flexWrap: 'wrap',
        '& > li': {
            display: 'block',
            paddingRight: '1rem',
            '&:last-child': {
                paddingRight: 0,
            },
            '& > button.MuiButtonBase-root': {
                '&::before': {
                    borderBottomColor: 'rgba(0, 0, 0, 0.25)'
                },
                marginTop: '-2px',
                fontSize: '0.8rem',
                lineHeight: 1.5,
                '& > svg': {
                    fontSize: '1rem',
                },
            },
        },
    },
    '& > button': {
        minWidth: 'auto',
        textWrap: 'nowrap',
    }
});

export default StrengthView;
