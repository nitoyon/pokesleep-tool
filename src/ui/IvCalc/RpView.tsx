import React from 'react';
import PokemonIv from '../../util/PokemonIv';
import PokemonRp, { RpStrengthResult, rpEstimateThreshold } from '../../util/PokemonRp';
import { round1, round2, round3, formatWithComma } from '../../util/NumberUtil';
import PokemonStrength, { StrengthParameter, createStrengthParameter } from '../../util/PokemonStrength';
import BerryIngSkillView from './BerryIngSkillView';
import RaderChart from './RaderChart';
import RpLabel from './RpLabel';
import { Button, Dialog, DialogActions } from '@mui/material';
import IngredientIcon from './IngredientIcon';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { styled } from '@mui/system';
import { Trans, useTranslation } from 'react-i18next';

const RpView = React.memo(({pokemonIv, width}: {pokemonIv: PokemonIv, width: number}) => {
    const { t } = useTranslation();
    const [rpInfoOpen, setRpInfoOpen] = React.useState(false);
    const [rpValueOpen, setRpValueOpen] = React.useState(false);
    const [rpType, setRpType] = React.useState<"berry"|"ingredient"|"skill">("berry");

    const onRpInfoClick = React.useCallback(() => {
        setRpInfoOpen(true);
    }, []);
    const onRpInfoClose = React.useCallback(() => {
        setRpInfoOpen(false);
    }, []);
    const onBerryInfoClick = React.useCallback(() => {
        setRpValueOpen(true);
        setRpType("berry");
    }, [setRpValueOpen]);
    const onIngInfoClick = React.useCallback(() => {
        setRpValueOpen(true);
        setRpType("ingredient");
    }, [setRpValueOpen]);
    const onSkillInfoClick = React.useCallback(() => {
        setRpValueOpen(true);
        setRpType("skill");
    }, [setRpValueOpen]);
    const onRpValueClose = React.useCallback(() => {
        setRpValueOpen(false);
    }, [setRpValueOpen]);

    const rp = new PokemonRp(pokemonIv);
    const rpResult: RpStrengthResult = rp.calculate();

    const strengthParameter: StrengthParameter = createStrengthParameter({
        helpBonusCount: pokemonIv.hasHelpingBonusInActiveSubSkills ? 1 : 0,
    });
    const strength = new PokemonStrength(pokemonIv, strengthParameter).calculate();

    const pokemon = rp.pokemon;
    const raderHeight = 400;

    return (<>
        <div>
            <RpLabel rp={rpResult.rp} iv={pokemonIv} showIcon onClick={onRpInfoClick}/>
            <BerryIngSkillView
                berryValue={round1(rpResult.berryRp)}
                berryProb={round1(rp.berryRatio * 100)}
                berrySubValue={<>
                    <LocalFireDepartmentIcon sx={{color: "#ff944b", width: '1rem', height: '1rem'}}/>
                    {formatWithComma(Math.round(strength.berryTotalStrength))}
                </>}
                onBerryInfoClick={onBerryInfoClick}
                ingredientValue={round1(rpResult.ingredientRp)}
                ingredientProb={round1(rp.ingredientRatio * 100)}
                ingredientSubValue={<>{strength.ingredients.map(x => <React.Fragment key={x.name}>
                    <IngredientIcon name={x.name}/>{round1(x.count)}
                </React.Fragment>)}</>}
                onIngredientInfoClick={onIngInfoClick}
                skillValue={round1(rpResult.skillRp)}
                skillProb={round1(rp.skillRatio * 100)}
                skillSubValue={strength.skillCount.toFixed(2) + t('times unit')}
                onSkillInfoClick={onSkillInfoClick}/>
            <RpInfoDialog open={rpInfoOpen} onClose={onRpInfoClose}/>
            <RpValueDialog open={rpValueOpen} onClose={onRpValueClose}
                rp={rp} rpResult={rpResult} rpType={rpType}/>
        </div>
        <RaderChart width={width} height={raderHeight} speciality={pokemon.speciality}
            berry={rpResult.berryRp / 2000}
            ingredient={rpResult.ingredientRp / 2000}
            skill={rpResult.skillRp / 2000}/>
    </>);
});

const RpInfoDialog = React.memo(({open, onClose}: {
    open: boolean,
    onClose: () => void,
}) => {
    const { t } = useTranslation();
    return <StyledRpInfoDialog open={open} onClose={onClose}>
        <article>
            <h2>{t('rp')}</h2>
            <p><Trans i18nKey="rp formula" components={{
                link: <a href={t('rp formula doc url')}>{t('rp formula doc title')}</a>
            }}/></p>
            <p>{t('estimated beyond level', {level: rpEstimateThreshold})}</p>

            <h2>{t('strength, ingredients, skill count')}</h2>
            <p>{t('the amount under the following condition')}</p>
            <ul>
                <li>{t('period')}: {t('1day')}</li>
                <li>{t('favorite berry')}: {t('none')}</li>
                <li>{t('good camp ticket')}: {t('none')}</li>
                <li>{t('area bonus')}: 0%</li>
                <li>{t('helping bonus other pokemon')}: {t('none')}</li>
                <li>{t('skills.Energy for Everyone S')}: 18 × 3</li>
                <li>{t('sleep score')}: 100</li>
                <li>{t('tap frequency')} ({t('awake')}): {t('every minute')}</li>
                <li>{t('tap frequency')} ({t('asleep')}): {t('none')}</li>
            </ul>
            <p>{t('use strength tab if you want to change these condition')}</p>
            <p>{t('estimated beyond level', {level: rpEstimateThreshold})}</p>
        </article>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledRpInfoDialog>;
});

const StyledRpInfoDialog = styled(Dialog)({
    '& article': {
        margin: '1rem 1rem 0 1rem',
        '& > h2': {
            fontSize: '1rem',
            margin: '0.8rem 0 0 0',
            lineHeight: 1.2,
            '&:first-of-type': {
                margin: 0,
            }
        },
        '& > p': {
            fontSize: '0.8rem',
            margin: '0.3rem 0',
        },
        '& > ul': {
            margin: '0.5rem 0',
            padding: '0 0 0 1.5rem',
            '& > li': {
                margin: '0.2rem 0',
                fontSize: '0.8rem',
            },
        },
    }
});


const StyledRpDialog = styled(Dialog)({
    '& header': {
        margin: '1rem',
        '& > h1': {
            fontSize: '1.5rem',
            margin: 0,
            '& > span': {
                fontWeight: 400,
                display: 'inline-block',
                width: '4rem',
                fontSize: '.6rem',
                padding: '.1rem 0',
                textAlign: 'center',
                color: 'white',
                borderRadius: '.6rem',
                verticalAlign: '50%',
            },
            '& > strong': {
                paddingLeft: '0.5rem',
            },
        },
        '& > h2': {
            display: 'inline-block',
            fontWeight: 'normal',
            fontSize: '0.9rem',
            margin: '0.3rem 0 0 0.5rem',
            lineHeight: '1.9',
        },
    },

    '& article': {
        margin: '1rem .5rem 0 .5rem',
        display: 'grid',
        gridGap: '.5rem',
        rowGap: '.8rem',
        gridTemplateColumns: 'max-content 1fr',
        fontSize: '0.9rem',
        '& > div': {
            textAlign: 'right',
        }
    },
    '& footer': {
        margin: '1rem 1rem 0 1rem',
        fontSize: '0.8rem',
        '& > p': {
            margin: '.5rem 0 0 0',
        },
    },
    '& span.box': {
        borderRadius: '.3rem',
        padding: '.1rem .4rem',
        margin: '0',
        color: 'white',
        textAlign: 'center',
    },
    '& span.box1': { background: '#1ebee1' },
    '& span.box2': { background: '#27c18e' },
    '& span.box3': { background: '#e7c300' },
    '& span.box4': { background: '#ce5052' },
    '& span.box5': { background: '#ce3fa3' },
});

const RpValueDialog = React.memo(({open, onClose, rp, rpResult, rpType}: {
    open: boolean,
    onClose: () => void,
    rp: PokemonRp,
    rpResult: RpStrengthResult,
    rpType: "berry"|"ingredient"|"skill",
}) => {
    const { t } = useTranslation();
    let color = "", rpVal = "", title = t(rpType);
    const param1 = round2(rp.helpCountPer5Hour);
    const desc1 = t('helps per 5 hours');
    let param2 = "", desc2 = "", param3 = "", desc3 = "",
        param4 = "", desc4 = "";
    const bonus = rp.bonus;
    const param5 = bonus.toString();
    if (rpType === "berry") {
        color = '#24d76a';
        rpVal = round1(rpResult.berryRp);
        param2 = round1(rp.berryRatio * 100) + '%';
        desc2 = t('berry rate');
        param3 = rp.berryStrength.toString();
        desc3 = t('berry strength');
        param4 = rp.berryCount.toString()
        desc4 = t('berry count');
    }
    else if (rpType === "ingredient") {
        color = '#fab855';
        rpVal = round1(rpResult.ingredientRp);
        param2 = round1(rp.ingredientRatio * 100) + '%';
        desc2 = t('ingredient rate');
        param3 = round1(rp.ingredientEnergy);
        desc3 = t('ingredient strength');
        param4 = round3(rp.ingredientG);
        desc4 = t('ingredient factor');
    }
    else {
        color = '#44a2fd';
        rpVal = round1(rpResult.skillRp);
        param2 = round1(rp.skillRatio * 100) + '%';
        desc2 = t('skill rate');
        param3 = formatWithComma(rp.skillValue);
        desc3 = t('skill strength');
    }

    return <StyledRpDialog open={open} onClose={onClose}>
        <header>
            <h1>
                <span style={{background: color}}>{title}</span>
                <strong>{rpVal}</strong>
            </h1>
            <h2>
                <span className="box box1">{param1}</span><> × </>
                <span className="box box2">{param2}</span><> × </>
                <span className="box box3">{param3}</span><> × </>
                {param4 !== "" && <><span className="box box4">{param4}</span><> × </></>}
                <span className="box box5">{param5}</span>
            </h2>
        </header>
        <article>
            <div><span className="box box1">{param1}</span></div>
            <span>{desc1}</span>
            <div><span className="box box2">{param2}</span></div>
            <span>{desc2}</span>
            <div><span className="box box3">{param3}</span></div>
            <span>{desc3}</span>
            {param4 !== "" && <>
            <div><span className="box box4">{param4}</span></div>
            <span>{desc4}</span>
            </>}
            <div><span className="box box5">{param5}</span></div>
            <span><Trans i18nKey="bonus factor" components={{
                nature: <>{round2(rp.energyBonus)}</>,
                subskill: <>{round2(rp.subSkillBonus)}</>,
            }}/></span>
        </article>
        <footer>
            <p><Trans i18nKey="rp formula" components={{
                link: <a href={t('rp formula doc url')}>{t('rp formula doc title')}</a>
            }}/></p>
            <p>{t('estimated beyond level', {level: rpEstimateThreshold})}</p>
        </footer>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledRpDialog>;
});

export default RpView;
