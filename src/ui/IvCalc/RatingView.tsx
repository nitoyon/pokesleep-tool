import React from 'react';
import PokemonIv from '../../util/PokemonIv';
import PokemonRating from '../../util/PokemonRating';
import BerryIngSkillView from './BerryIngSkillView';
import RaderChart from './RaderChart';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent, 
    DialogContentText, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from 'react-i18next';

const RatingView = React.memo(({pokemonIv, width}: {
    pokemonIv: PokemonIv,
    width: number,
}) => {
    const { t } = useTranslation();
    const [helpOpen, setHelpOpen] = React.useState(false);
    const onHelpClick = React.useCallback(() => {
        setHelpOpen(true);
    }, [setHelpOpen]);
    const onHelpDialogClose = React.useCallback(() => {
        setHelpOpen(false);
    }, [setHelpOpen]);

    const rating = new PokemonRating(pokemonIv);
    const result = rating.calculate();

    const raderHeight = 400;

    const trunc1 = (n: number) => {
        n = Math.round(n * 10) / 10;
        return t('num', {n: Math.floor(n)}) +
            "." + (n * 10 % 10);
    };

    return (<div>
        <p style={{margin: '0'}}>
            {t('rate subskill and nature')}
            <IconButton onClick={onHelpClick}>
                <InfoOutlinedIcon style={{color: '#999'}}/>
            </IconButton>
        </p>
        <BerryIngSkillView small
            berryValue={<>{trunc1(result.berryScore)}<span>pt</span></>}
            berryProb={trunc1(result.berryRatio * 100)}
            berrySubValue=""
            ingredientValue={<>{trunc1(result.ingScore)}<span>pt</span></>}
            ingredientProb={trunc1(result.ingRatio * 100)}
            ingredientSubValue=""
            skillValue={<>{trunc1(result.skillScore)}<span>pt</span></>}
            skillProb={trunc1(result.skillRatio * 100)}
            skillSubValue=""/>
        <RaderChart width={width} height={raderHeight} speciality={pokemonIv.pokemon.speciality}
            berry={result.berryScore / 100}
            ingredient={result.ingScore / 100}
            skill={result.skillScore / 100}/>
        <HelpDialog open={helpOpen} onClose={onHelpDialogClose}/>
    </div>);
});

const HelpDialog = React.memo(({open, onClose}: {
    open: boolean,
    onClose: () => void,
}) => {
    const { t } = useTranslation();

    return <Dialog open={open} onClose={onClose}>
        <DialogTitle>{t('rating')}</DialogTitle>
        <DialogContent dividers>
            <DialogContentText>{t('rating detail1')}</DialogContentText>
            <DialogContentText>{t('rating detail2')}</DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </Dialog>;
});

export default RatingView;
