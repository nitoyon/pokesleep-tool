import React from 'react';
import { getEventBonus } from '../../../data/events';
import { round1, round2, formatNice, formatWithComma } from '../../../util/NumberUtil';
import PokemonStrength, { IngredientStrength, StrengthResult,
    recipeLevelBonus
} from '../../../util/PokemonStrength';
import { ingredientStrength } from '../../../util/PokemonRp';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import InfoButton from '../InfoButton';
import { IvAction } from '../IvState';
import IngredientIcon from '../IngredientIcon';
import IngredientCountIcon from '../IngredientCountIcon';
import RecipeDialog from './RecipeDialog';
import { StyledInfoDialog } from './StrengthBerryIngSkillView';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const IngHelpDialog = React.memo(({open, strength, result, dispatch, onClose}: {
    open: boolean,
    strength: PokemonStrength,
    result: StrengthResult,
    dispatch: React.Dispatch<IvAction>,
    onClose: () => void,
}) => {
    const { t } = useTranslation();
    const [recipeDialogOpen, setRecipeBonusHelpOpen] = React.useState(false);
    const onRecipeBonusInfoClick = React.useCallback(() => {
        setRecipeBonusHelpOpen(true);
    }, []);
    const onRecipeBonusHelpClose = React.useCallback(() => {
        setRecipeBonusHelpOpen(false);
    }, []);

    if (!open) {
        return <></>;
    }

    const param = strength.parameter;
    if (param.tapFrequency === 'none') {
        return (
            <Dialog open={open} onClose={onClose}>
                <DialogContent style={{fontSize: '0.95rem', whiteSpace: 'pre-wrap'}}>
                    {t('no ingredient')}
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}>{t('close')}</Button>
                </DialogActions>
            </Dialog>
        );
    }

    const ingSlot = strength.pokemonIv.level < 30 ? 1 :
        strength.pokemonIv.level < 60 ? 2 : 3;
    const ings = [[result.ing1]];
    if (ingSlot > 1) {
        if (result.ing2.name === "unknown") {
            // Darkrai not unlocked
        }
        else if (ings[0][0].name === result.ing2.name) {
            ings[0].push(result.ing2);
        }
        else {
            ings.push([result.ing2]);
        }
    }
    if (ingSlot > 2 && result.ing3 !== undefined) {
        if (result.ing3.name === "unknown") {
            // Darkrai not unlocked
        }
        else if (ings[0][0].name === result.ing3.name) {
            ings[0].push(result.ing3);
        }
        else if (ings.length > 1 && ings[1][0].name === result.ing3.name) {
            ings[1].push(result.ing3);
        }
        else {
            ings.push([result.ing3]);
        }
    }

    const ingInRecipeStrengthRate = param.recipeBonus === 0 ? 1 :
        (1 + param.recipeBonus / 100) * (1 + recipeLevelBonus[param.recipeLevel] / 100);
    const recipeRate = ingInRecipeStrengthRate * 0.8 + 0.2;
    const dishBonus = getEventBonus(param.event, param.customEventBonus)?.dish ?? 1;

    return <StyledInfoDialog open={open} onClose={onClose}>
        <DialogTitle>
            <article>
                <LocalFireDepartmentIcon sx={{color: "#ff944b"}}/>
                {formatWithComma(Math.round(result.ingStrength))}
            </article>
        </DialogTitle>
        <DialogContent>
            <div className={`inggrid ings${ings.length}`}>
                {getIngDetail(strength, result, recipeRate, ingSlot, ings[0], t)}
                {ings.length > 1 && getIngDetail(strength, result, recipeRate, ingSlot, ings[1], t)}
                {ings.length > 2 && getIngDetail(strength, result, recipeRate, ingSlot, ings[2], t)}
            </div>
            <article>
                <div><span className="box box3">{round2(result.ingHelpCount)}</span></div>
                <span>{t('ing help count')}</span>
                <footer>
                    {round1(result.notFullHelpCount)}
                    <small> ({t('normal help count')})</small>
                    <> × </>
                    {round1(result.ingRate * 100)}%
                    <small> ({t('ingredient rate')})</small>
                </footer>
                <div><span className="box box1">{round1(ings[0].reduce((p, c) => p + c.count, 0))}</span></div>
                <span>{t('ing count')}</span>
                <div><span className="box box2">{ingredientStrength[ings[0][0].name]}</span></div>
                <span>{t('strength per ing')}</span>
                <div><span className="box box5">{round2(recipeRate)}</span></div>
                <span>{t('recipe multiplier')}<InfoButton onClick={onRecipeBonusInfoClick}/></span>
                <footer>
                    <>(</>
                    {round2(param.recipeBonus === 0 ? 1 : 1 + param.recipeBonus / 100)}
                    <small> ({t('recipe bonus')})</small>
                    <> × </>
                    {round2(1 + recipeLevelBonus[param.recipeLevel] / 100)}
                    <small>({t('average recipe level')})</small>
                    <>) × 0.8 + 0.2</>
                </footer>
                <div><span className="box box4">{param.fieldBonus}%</span></div>
                <span>{t('area bonus')}</span>
                {dishBonus !== 1 && <>
                    <div><span className="box box6">{dishBonus}</span></div>
                    <span>{t('event bonus')}</span>
                </>}
            </article>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
        <RecipeDialog open={recipeDialogOpen} parameter={strength.parameter}
            dispatch={dispatch} onClose={onRecipeBonusHelpClose}/>
    </StyledInfoDialog>;
});

function getIngDetail(strength: PokemonStrength, result: StrengthResult,
    recipeRatio: number, ingSlot: number,
    ing: IngredientStrength[], t: typeof i18next.t): React.ReactNode {
    if (strength.parameter.tapFrequency === 'none') {
        return <article>ー</article>;
    }

    const count = ing.reduce((p, c) => p + c.count, 0);
    const ingName = ing[0].name;
    const param = strength.parameter;
    const dishBonus = getEventBonus(param.event, param.customEventBonus)?.dish ?? 1;

    return <>
        <span>
            <IngredientIcon name={ing[0].name}/>
            {round1(count)}
        </span>
        <div>
            <span className="box box3">{round2(result.ingHelpCount)}</span>
            <> × </>
            {ing.length > 1 ? '(' : ''}
            {ing.map((ing, i) => <span key={i}>
                {i === 0 ? '' : ' + '}
                <IngredientCountIcon count={ing.helpCount} name={ingName}/>
            </span>)}
            {ing.length > 1 ? ')' : ''}
            <>{ingSlot > 1 ? ` / ${ingSlot}` : ''}</>
        </div>
        <span style={{marginTop: '-0.5rem'}}>
            <LocalFireDepartmentIcon sx={{color: "#ff944b"}} className="strength"/>
            {formatNice(ing.reduce((p, c) => p + c.strength, 0), t)}
        </span>
        <div style={{marginTop: '-0.5rem'}}>
            <span className="box box1">{round1(count)}</span><> × </>
            <span className="box box2">{ingredientStrength[ingName]}</span><> × </>
            <span className="box box5">{round2(recipeRatio)}</span><> × </>
            <span>
                <>(1+</>
                <span className="box box4">{param.fieldBonus}%</span>
                <>)</>
            </span>
            {dishBonus !== 1 && <>
                <> × </>
                <span className="box box6">{dishBonus}</span>
            </>}
        </div>
    </>;
}

export default IngHelpDialog;
