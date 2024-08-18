import React from 'react';
import { styled } from '@mui/system';
import SubSkill, { SubSkillType } from '../../util/SubSkill';
import SubSkillList from '../../util/SubSkillList';
import { Badge, Button, ButtonBase, Dialog, DialogActions } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';

/** Event object for onChange event handler */
export interface SubSkillChangeEvent {
    value: SubSkillList;
};

const StyledSubSkillContainer = styled('div')({
    margin: 'clamp(.3rem, 0.7vh, .5rem) 0',
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridGap: '.4rem .5rem',
});

const SubSkillControl = React.memo(({
    value, onChange,
}: {
    value: SubSkillList,
    onChange: (event: SubSkillChangeEvent) => void,
}) => {
    const [open, setOpen] = React.useState(false);
    const [editingLevel, setEditingLevel] = React.useState<10|25|50|75|100>(10);

    const onClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setEditingLevel(parseInt(event.currentTarget.name, 10) as 10|25|50|75|100);
        setOpen(true);
    }, [setEditingLevel, setOpen]);

    const onLevelChange = React.useCallback((level: 10|25|50|75|100) => {
        setEditingLevel(level);
    }, [setEditingLevel]);

    const onPopupClosed = React.useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    return <StyledSubSkillContainer>
        <SubSkillButton level={10} value={value.lv10} onClick={onClick}/>
        <SubSkillButton level={25} value={value.lv25} onClick={onClick}/>
        <SubSkillButton level={50} value={value.lv50} onClick={onClick}/>
        <SubSkillButton level={75} value={value.lv75} onClick={onClick}/>
        <SubSkillButton level={100} value={value.lv100} onClick={onClick}/>
        <EditSubSkillDialog open={open} level={editingLevel} value={value}
            onClose={onPopupClosed} onChange={onChange} onLevelChange={onLevelChange}/>
    </StyledSubSkillContainer>;
});

const StyledSubSkillButton = styled(ButtonBase)(({theme}) => {
    const buttonTheme = (theme.typography as {button: {
        fontFamily: string,
        fontSize: string,
        fontWeight: number,
        letterSpacing: string,
        lineHeight: number,
    }}).button;
    return {
        fontFamily: buttonTheme.fontFamily,
        fontSize: '0.8rem',
        fontWeight: buttonTheme.fontWeight,
        letterSpacing: buttonTheme.letterSpacing,
        lineHeight: buttonTheme.lineHeight,
        height: '1.6rem',
        padding: '.2rem',
        border: '1px solid #999',
        borderRadius: '.4rem',
        background: '#d0d0d0',
        '&.gold': { background: '#fbe778', borderColor: '#c19255' },
        '&.blue': { background: '#d3e9f7', borderColor: '#5e7da0' },
        '&.white': { background: '#f3f3f3', borderColor: '#999999' },
        '&.selected': { background: '#888c8f' },
    };
});

const SubSkillButton = React.memo(({level, value, onClick}: {
    level: number,
    value: SubSkill|null,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
    const {t} = useTranslation();

    const label: string = value === null ? '' : t(`subskill.${value.name}`);
    let color = "";
    if (value?.isGold) { color = "gold"; }
    else if (value?.isBlue) { color = "blue"; }
    else if (value?.isWhite) { color = "white"; }
    return <StyledSubSkillButton name={level.toString()} className={color}
        onClick={onClick}>
        {label}
    </StyledSubSkillButton>;
});

const StyledEditSubSkillContainer = styled('div')({
    'header': {
        fontSize: '.9rem',
    },
    '& div.subskill_list50': {
        margin: '.2rem 0 1.2rem 0',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridGap: '.3rem',
        '& button': {
            fontSize: '0.75rem',
            whiteSpace: 'nowrap'
        }
    },
    '& div.subskill_list25': {
        margin: '.8rem 0',
        display: 'grid',
        gridTemplateColumns: '1fr 2.5rem 2.5rem 2.5rem',
        gridGap: '.3rem',
        '& header': {
            textAlign: 'right',
            paddingRight: '.8rem',
        }
    }
});

const StyledBadge = styled(Badge)(({ theme }) => ({
    position: 'absolute',
    right: '.5rem',
    top: '0',
    '& .MuiBadge-badge': {
        border: `2px solid ${theme.palette.background.paper}`,
        backgroundColor: "#24d76a",
        padding: 0,
        '& > svg': {
            width: '14px',
            height: '14px',
            fontSize: '12px',
            padding: 0,
            margin: 0,
        },
    },
    '&.isnum .MuiBadge-badge': {
        padding: '0 4px',
    },
}));
  
const EditSubSkillDialog = React.memo(({open, value, level, onChange, onClose, onLevelChange}: {
    open: boolean,
    value: SubSkillList,
    level: 10|25|50|75|100,
    onChange: (event: SubSkillChangeEvent) => void,
    onClose: () => void,
    onLevelChange: (level: 10|25|50|75|100) => void,
}) => {
    const { t } = useTranslation();

    const onClick = React.useCallback((subSkillType: SubSkillType) => {
        const newValue = new SubSkillList(value);
        const skill = new SubSkill(subSkillType);
        const currentLevel = newValue.getSubSkillLevel(skill);
        if (currentLevel === -1) {
            newValue.set(level, skill);
        } else {
            newValue.set(currentLevel, null);
        }

        onChange({value: newValue});
        if (newValue.lv10 === null) { onLevelChange(10); }
        else if (newValue.lv25 === null) { onLevelChange(25); }
        else if (newValue.lv50 === null) { onLevelChange(50); }
        else if (newValue.lv75 === null) { onLevelChange(75); }
        else if (newValue.lv100 === null) { onLevelChange(100); }
        else { onClose(); }
    }, [onChange, onClose, onLevelChange, level, value]);

    const onClear = React.useCallback(() => {
        onChange({value: new SubSkillList()});
        onLevelChange(10);
    }, [onChange, onLevelChange]);

    const subSkill2Badge = React.useCallback((subSkill: SubSkill) => {
        const level = value.getSubSkillLevel(subSkill);
        return level < 0 ? 0 : level;
    }, [value]);

    return <Dialog open={open} onClose={onClose}>
        <div style={{
            padding: '1.2rem 1rem 1rem 1rem',
            fontSize: '1.1rem'
        }}><Trans i18nKey="select subskill at level xxx"
            components={{
                level: <strong>{t('level')} {level}</strong>,
            }}/></div>
        <div style={{padding: '0 1rem'}}>
            <EditSubSkillControl subSkill2Badge={subSkill2Badge}
                onClick={onClick}/>
        </div>
        <DialogActions>
            <Button onClick={onClear}>{t('clear')}</Button>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </Dialog>;
});

export const EditSubSkillControl = React.memo(({subSkill2Badge, onClick}: {
    subSkill2Badge: (subSkill: SubSkill) => number|React.ReactElement,
    onClick: (value: SubSkillType) => void,
}) => {
    const { t } = useTranslation();

    const onClickHandler = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        onClick(event.currentTarget.value as SubSkillType)
    }, [onClick]);

    const createButton = React.useCallback((name: SubSkillType,
        label: string|undefined) => {
        const subSkill = new SubSkill(name);
        const color = subSkill.isGold ? "gold" :
            subSkill.isBlue ? "blue" : "white";
        const badge = subSkill2Badge(subSkill);
        const cls = badge !== 0 ? `${color} selected` : color;
        if (label === undefined) {
            label = t(`subskill.${name}`);
        }
        return <>
            <StyledSubSkillButton onClick={onClickHandler}
                className={cls}
                value={name}>
                {label}
                <StyledBadge color="secondary" badgeContent={badge} max={100}
                    className={typeof(badge) === 'number' ? 'isnum' : ''}/>
            </StyledSubSkillButton>
        </>;
    }, [onClickHandler, subSkill2Badge, t]);

    return <StyledEditSubSkillContainer>
        <header>{t('subskill.Gold colored')}</header>
        <div className="subskill_list50">
            {createButton("Berry Finding S", undefined)}
            {createButton("Helping Bonus", undefined)}
            {createButton("Sleep EXP Bonus", undefined)}
            {createButton("Research EXP Bonus", undefined)}
            {createButton("Energy Recovery Bonus", undefined)}
            {createButton("Dream Shard Bonus", undefined)}
        </div>
        <div className="subskill_list25">
            <header>{t('subskill.Skill Level Up')}</header>
            {createButton("Skill Level Up M", "M")}
            {createButton("Skill Level Up S", "S")}
        </div>
        <div className="subskill_list25">
            <header>{t('subskill.Skill Trigger')}</header>
            {createButton("Skill Trigger M", "M")}
            {createButton("Skill Trigger S", "S")}
        </div>
        <div className="subskill_list25">
            <header>{t('subskill.Helping Speed')}</header>
            {createButton("Helping Speed M", "M")}
            {createButton("Helping Speed S", "S")}
        </div>
        <div className="subskill_list25">
            <header>{t('subskill.Ingredient Finder')}</header>
            {createButton("Ingredient Finder M", "M")}
            {createButton("Ingredient Finder S", "S")}
        </div>
        <div className="subskill_list25">
            <header>{t('subskill.Inventory Up')}</header>
            {createButton("Inventory Up L", "L")}
            {createButton("Inventory Up M", "M")}
            {createButton("Inventory Up S", "S")}
        </div>
    </StyledEditSubSkillContainer>;
});

export default SubSkillControl;
