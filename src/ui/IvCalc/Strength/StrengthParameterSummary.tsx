import React from 'react';
import { styled } from '@mui/system';
import IvState, { IvAction } from '../IvState';
import AreaControlDialog from './AreaControlDialog';
import EventConfigDialog from './EventConfigDialog';
import FixedLevelSelect from './FixedLevelSelect';
import PeriodSelect from './PeriodSelect';
import SelectEx from '../../common/SelectEx';
import TextLikeButton from '../../common/TextLikeButton';
import { getActiveHelpBonus } from '../../../data/events';
import { isExpertField } from '../../../data/fields';
import {
    allFavoriteFieldIndex, noFavoriteFieldIndex, StrengthParameter, whistlePeriod,
} from '../../../util/PokemonStrength';
import { Button, IconButton, MenuItem } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';

const StrengthParameterSummary = React.memo(({state, dispatch}: {
    state: IvState,
    dispatch: React.Dispatch<IvAction>,
}) => {
    const { t } = useTranslation();
    const [areaDialogOpen, setAreaDialogOpen] = React.useState(false);
    const [eventConfigOpen, setEventConfigOpen] = React.useState(false);
    const parameter = state.parameter;

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

    return (<StrengthParameterPreview>
            <span className="edit">
                <Button onClick={onEditClick} size="small">{t('details')}</Button>
            </span>
            <span>
                <TextLikeButton onClick={onAreaClick}>
                    {area}{fieldBonus}
                </TextLikeButton>
            </span>
            <span>
                <PeriodSelect dispatch={dispatch} value={parameter}/>
            </span>
            {parameter.level !== 0 && <span className="level">
                <FixedLevelSelect value={parameter} dispatch={dispatch}/>
            </span>}
            {parameter.maxSkillLevel && <span>
                <TextLikeButton onClick={onMaxSkillLevelClick}><strong>{t('calc with max skill level (short)')}</strong></TextLikeButton>
            </span>}
            {parameter.period !== whistlePeriod && <span>
                <>{t('good camp ticket (short)')}: </>
                <TextLikeButton onClick={onCampTicketClick} style={{width: '2rem'}}>{t(parameter.isGoodCampTicketSet ? 'on' : 'off')}</TextLikeButton>
            </span>}
            {isEventScheduled && <span>
                <SelectEx value={parameter.event} onChange={onEventChange}>
                    {eventMenuItems}
                </SelectEx>
                {parameter.event === 'custom' && <IconButton size="small" style={{padding: '2px'}}
                    onClick={onEventConfigClick}>
                    <SettingsIcon/>
                </IconButton>}
            </span>}
        <AreaControlDialog open={areaDialogOpen} onClose={onAreaDialogClose}
            value={state.parameter} onChange={onParameterChange}/>
        <EventConfigDialog open={eventConfigOpen} onClose={onEventConfigClose}
            value={state.parameter} onChange={onParameterChange}/>
    </StrengthParameterPreview>);
});

const StrengthParameterPreview = styled('div')({
    marginTop: '0.2rem',
    padding: '.4rem .6rem',
    border: '1px solid #ccc',
    borderRadius: '1rem',
    background: '#f3f5f0',
    fontSize: '0.8rem',
    lineHeight: 1.8,
    '& > span': {
        float: 'left',
        textWrap: 'none',
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
        '&.level > button': {
            fontWeight: 'bold',
        },
        '&.edit': {
            float: 'right',
            padding: 0,
            '& > button': {
                textTransform: 'none',
                minWidth: 0,
                textWrap: 'nowrap',
            },
        },
    },
    // clearfix
    '&::after': {
        content: "''",
        display: 'table',
        clear: 'both',
    }    
});

export default StrengthParameterSummary;
