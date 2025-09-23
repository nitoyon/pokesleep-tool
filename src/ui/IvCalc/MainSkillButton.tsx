import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import MainSkillIcon from './MainSkillIcon';
import { MainSkillName } from '../../util/MainSkill';
import { Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';

const MainSkillButton = React.memo(({mainSkill, checked, onClick}: {
    mainSkill: MainSkillName,
    checked: boolean,
    onClick: (value: MainSkillName) => void,
}) => {
    const { t } = useTranslation();

    const onMainSkillClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const value = e.currentTarget.value as MainSkillName;
        onClick(value);
    }, [onClick]);
    return <StyledMainSkillButton
        value={mainSkill} onClick={onMainSkillClick}>
        <div>
            {!checked && <MainSkillIcon mainSkill={mainSkill}/>}
            {checked && <CheckIcon role="switch"/>}
        </div>
        {t(`skills.${mainSkill}`)}
    </StyledMainSkillButton>;
});

const StyledMainSkillButton = styled(Button)({
    height: '2.2rem',
    lineHeight: 1.2,
    margin: '1%',
    color: 'black',
    fontSize: '0.8rem',
    justifyContent: 'left',
    alignItems: 'center',
    textAlign: 'left',
    padding: 0,
    textTransform: 'none',
    '& > div': {
        width: '24px',
        '& > svg': {
            marginRight: '4px',
        },
        '& > svg[role="switch"]': {
            color: 'white',
            width: '18px',
            height: '18px',
            background: '#24d76a',
            borderRadius: '5px',
            fontSize: '15px',
            border: '2px solid white',
        },
    },
});

export default MainSkillButton;
