import React from 'react';
import { formatWithComma } from '../../../util/NumberUtil';
import PokemonIv from '../../../util/PokemonIv';
import PokemonRp from '../../../util/PokemonRp';
import { StyledInfoDialog } from './StrengthBerryIngSkillView';
import { Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useTranslation } from 'react-i18next';

const BerryStrengthDialog = React.memo(({open, onClose, iv, fieldBonus, berryBonus}: {
    open: boolean,
    onClose: () => void,
    iv: PokemonIv,
    fieldBonus: number,
    berryBonus: number,
}) => {
    const { t } = useTranslation();
    if (!open) {
        return <></>;
    }

    const berryRawStrength = new PokemonRp(iv).berryStrength;
    const berryStrength = Math.ceil(
        Math.ceil(berryRawStrength * (1 + fieldBonus / 100)) * berryBonus);

    return <StyledInfoDialog open={open} onClose={onClose}
        PaperProps={{style: {maxWidth: '20rem'}}}>
        <DialogTitle>
            <h1>
                <LocalFireDepartmentIcon sx={{color: "#ff944b"}}/>
                {formatWithComma(berryStrength)}
            </h1>
            <h2>
                <span className="box box3">{berryRawStrength}</span><> × </>
                (1 + <span className="box box4">{fieldBonus}%</span>)<> × </>
                <span className="box box5">{berryBonus}</span>
            </h2>
        </DialogTitle>
        <DialogContent>
            <article>
                <div><span className="box box3">{berryRawStrength}</span></div>
                <span>{t('berry strength')}</span>
                <div><span className="box box4">{fieldBonus}%</span></div>
                <span>{t('area bonus')}</span>
                <div><span className="box box5">{berryBonus}</span></div>
                <span>{t('favorite berry')}</span>
            </article>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledInfoDialog>;
});

export default BerryStrengthDialog;
