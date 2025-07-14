import React from 'react';
import { round1, formatWithComma } from '../../../util/NumberUtil';
import PokemonStrength, { StrengthResult } from '../../../util/PokemonStrength';
import { StyledInfoDialog } from './StrengthBerryIngSkillView';
import { Button, DialogActions } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useTranslation } from 'react-i18next';

const BerryHelpDialog = React.memo(({open, onClose, strength, result}: {
    open: boolean,
    onClose: () => void,
    strength: PokemonStrength,
    result: StrengthResult,
}) => {
    const { t } = useTranslation();
    if (!open) {
        return <></>;
    }

    const param = strength.parameter;
    const berryStrength = result.berryStrength * (strength.isFavoriteBerry() ? 2 : 1);
    return <StyledInfoDialog open={open} onClose={onClose}>
        <header>
            <h1>
                <LocalFireDepartmentIcon sx={{color: "#ff944b"}}/>
                {formatWithComma(Math.round(result.berryTotalStrength))}
            </h1>
            <h2>
                <span className="box box1">{berryStrength}</span><> × </>
                <span className="box box2">{result.berryCount}</span><> × </>
                <span className="box box3">{round1(result.berryHelpCount)}</span>
            </h2>
        </header>
        <article>
            <div><span className="box box1">{berryStrength}</span></div>
            <span>
                {t('actual berry strength')}<br/>
                <span className="box box4">{result.berryRawStrength}</span><> × </>
                (1 + <span className="box box5">{param.fieldBonus}%</span>)<> × </>
                <span className="box box6">{strength.isFavoriteBerry() ? 2 : 1}</span>
                <ul className="detail">
                    <li>
                        <span className="box box4">{result.berryRawStrength}</span>: {t('berry strength')}
                    </li>
                    <li>
                        <span className="box box5">{param.fieldBonus}%</span>: {t('area bonus')}
                    </li>
                    <li>
                        <span className="box box6">{strength.isFavoriteBerry() ? 2 : 1}</span>: {t('favorite berry')}
                    </li>
                </ul>
            </span>
            <div><span className="box box2">{result.berryCount}</span></div>
            <span>{t('berry count')}</span>
            <div><span className="box box3">{round1(result.berryHelpCount)}</span></div>
            <span>{t('berry help count')}
                <ul className="detail">
                    <li>
                        <strong>{round1(result.notFullHelpCount * result.berryRatio)}</strong>{t('times unit')}: {t('berry picking count')}
                        <footer>
                            {round1(result.notFullHelpCount)}
                            <small> ({t('normal help count')})</small>
                            <> × </>
                            {round1(result.berryRatio * 100)}%
                            <small> ({t('berry rate')})</small>
                        </footer>
                    </li>
                    <li>
                        <strong>{round1(result.fullHelpCount)}</strong>{t('times unit')}: {t('sneaky snacking')}
                    </li>
                </ul>
            </span>
        </article>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledInfoDialog>;
});

export default BerryHelpDialog;
