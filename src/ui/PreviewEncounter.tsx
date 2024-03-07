import React, {useState, useCallback} from 'react';
import { Alert, Button, Dialog, DialogContent, DialogTitle,
    DialogActions, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import fields, { FieldData, FieldEncounterData } from '../data/fields';
import { InputAreaData } from './InputArea'
import PreviewScore, { ScoreRange, getMinTimeForScore, getMaxTimeForScore } from './PreviewScore';
import { getPokemonCount } from '../util/PokemonCount';
import { useTranslation, Trans } from 'react-i18next'

interface PreviewEncounterProps {
    /** form data */
    data: InputAreaData;
}

export default function PreviewEncounter({data}:PreviewEncounterProps) {
    const { t }  = useTranslation();
    const [open, setOpen] = useState(false);

    const onClick = useCallback(() => {
        setOpen(true);
    }, [setOpen]);
    const onClose = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const field = fields[data.fieldIndex];
    if (field.encounter === undefined) {
        return <></>;
    }

    const encounters = [];
    for (const encounterData of field.encounter) {
        const pokemon = encounterData.pokemon;
        const type = encounterData.type;
        const ranges = [];
        for (const range of encounterData.range) {
            const minScore = Math.ceil(range.start / data.bonus / data.strength);
            const maxScore = Math.min(100,
                Math.floor(range.end / data.bonus / data.strength));
            if (minScore > maxScore || minScore > 100) {
                continue;
            }
            const count = getPokemonCount(field.powers, range.end);
            const minPower = minScore * data.bonus * data.strength;
            const maxPower = maxScore * data.bonus * data.strength;
            const minTime = getMinTimeForScore(minScore);
            const maxTime = getMaxTimeForScore(maxScore);
            const r:ScoreRange = {
                count,
                canGet: true,
                tooMuch: false,
                requiredStrength: 0,
                power: field.powers[count - 3],
                minScore,
                minTime,
                minPower,
                maxScore,
                maxTime,
                maxPower,
            };
            ranges.push(
                <PreviewScore
                    key={range.start}
                    count={count}
                    data={{...data, secondSleep: false}}
                    ranges={{firstSleep: r, secondSleep: null, nextStrength: null}}
                    onSecondSleepDetailClick={(data) =>{}}/>
            );
        }

        if (ranges.length > 0) {
            encounters.push(<div className="encounter">
                <span className={type + " sleep_type"}>{t(type)}</span>
                {t(pokemon)} {t('guaranteed score')}
                <IconButton aria-label="information" onClick={onClick}>
                    <InfoOutlinedIcon/>
                </IconButton>
                {ranges}
            </div>);
        }
    }

    return <>
        {encounters}
        <PreviewEncounterDialog open={open} onClose={onClose}
            field={field} encounter={field.encounter[0]}/>
    </>;
}

interface PreviewEncounterDialogProps {
    /** Whether dialog is open or not */
    open: boolean;
    field:FieldData;
    encounter:FieldEncounterData;
    /** callback function when dialog is closed */
    onClose: () => void;
}

const PreviewEncounterDialog = React.memo(({open, onClose, field, encounter}:PreviewEncounterDialogProps) => {
    const { t }= useTranslation();
    if (encounter === null) {
        return <></>;
    }

    const ranges = encounter.range.map((range) => {
        return <li key={range.start}>
            {t('num', {n: range.start})}
            {t('range separator')}
            {t('num', {n: range.end})}
        </li>;
    });

    return <Dialog open={open} onClose={onClose} className="guaranteed_dlg">
        <DialogTitle>{t("about guaranteed score")}</DialogTitle>
        <IconButton onClick={onClose} className="close_button">
            <CloseIcon/>
        </IconButton>
        <DialogContent dividers>
            <div>
                <Trans i18nKey="guaranteed score text"
                    components={{
                        area: <strong>{t(`area.${field.index}`)}</strong>,
                        pokemon: <strong>{t(encounter.pokemon)}</strong>,
                    }}/>
            </div>

            <ul>
                <li><span className={encounter.type + " sleep_type"}>{t(encounter.type)}</span></li>
                {ranges}
            </ul>
            <Alert severity="info">
                <Trans i18nKey="guaranteed score info"
                    components={{
                        x: <a href="https://x.com/pokemon_sleep_y/status/1765687668808323345" target="_blank" rel="noreferrer">x</a>
                    }}/>
            </Alert>
            <Alert severity="warning">{t("guaranteed score warning")}</Alert>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </Dialog>;
});