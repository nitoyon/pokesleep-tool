import React from 'react';
import { styled } from '@mui/system';
import Nature, { NatureEffect } from '../../util/Nature';
import { MenuList, MenuItem, Popper, Paper, ClickAwayListener } from '@mui/material';
import TextLikeButton from './TextLikeButton';
import { useTranslation } from 'react-i18next';

const NatureTextField = React.memo(({value, onChange}: {
    value: Nature,
    onChange: (value: Nature) => void,
}) => {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);
  
    const onClick = React.useCallback(() => {
        setOpen((prevOpen) => !prevOpen);
    }, [setOpen]);
  
    const onClose = React.useCallback(() => {
        setOpen(false);
    }, [setOpen]);
  
    // return focus to the button when we transitioned from !open -> open
    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current!.focus();
        }
        prevOpen.current = open;
    }, [open]);
  
    return <>
            <TextLikeButton ref={anchorRef} onClick={onClick}
                className={open ? "focused" : ""}>
                <NatureElement value={value}/>
            </TextLikeButton>
            <NatureEditPopper open={open} anchorRef={anchorRef}
                onClose={onClose} onChange={onChange}/>
    </>;
});

const NatureEditPopper = React.memo(({open, anchorRef, onClose, onChange}: {
    open: boolean,
    anchorRef: React.RefObject<HTMLButtonElement>,
    onClose: () => void,
    onChange: (value: Nature) => void,
}) => {
    const { t } = useTranslation();
    const [step, setStep] = React.useState<1|2>(1);
    const [upEffect, setUpEffect] = React.useState<NatureEffect|null>(null);

    const onUpEffectChange = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
        setUpEffect(event.currentTarget.getAttribute('value') as NatureEffect);
        setStep(2);
    }, [setStep]);

    const onNatureClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
        const name = event.currentTarget.getAttribute('value');
        if (name !== null) {
            onChange(new Nature(name));
            onClose();
        }
    }, [onChange, onClose]);

    const sortNatureByLocalName = React.useCallback((natures: Nature[]) =>
        natures
            .map(x => ({nature: x, key: t(`natures.${x.name}`)}))
            .sort((a, b) => a.key > b.key ? 1 : -1)
            .map(x => x.nature)
    , [t]);

    let menuItems: React.ReactNode[] = [];
    const upEffects: NatureEffect[] = ["No effect",
        "Speed of help", "Main skill chance",
        "Ingredient finding", "EXP gains", "Energy recovery"];
    if (step === 1) {
        for (const upEffect of upEffects) {
            const natureElms = sortNatureByLocalName(Nature.allNatures
                .filter(x => x.upEffect === upEffect))
                .map(x => <span key={x.name}>{t(`natures.${x.name}`)}</span>);
            const upElm = (upEffect === "No effect" ?
                    <>{t("nature effect.No effect")}</> :
                    <StyledNatureUpEffect>{t(`nature effect.${upEffect}`)}</StyledNatureUpEffect>);
            menuItems.push(<StyledUpEffectMenuItem
                key={upEffect} value={upEffect} onClick={onUpEffectChange}>
                <div>
                    <div className="up">{upElm}</div>
                    <div className="natures">{natureElms}</div>
                </div>
            </StyledUpEffectMenuItem>);
        }
    }
    if (step === 2) {
        const natures = sortNatureByLocalName(Nature.allNatures
                .filter(x => x.upEffect === upEffect));
        menuItems = natures.map(x => <MenuItem key={x.name}
            value={x.name} onClick={onNatureClick}>
            <NatureElement value={x}/>
        </MenuItem>);        
    }

    React.useEffect(() => {
        if (!open) {
            setStep(1);
        }
    }, [open]);

    return <Popper open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        disablePortal>
        <Paper elevation={12}>
          <ClickAwayListener onClickAway={onClose}>
            <MenuList>
                {menuItems}
            </MenuList>
          </ClickAwayListener>
        </Paper>
  </Popper>
;
});

const StyledNatureElement = styled('div')({
    display: 'grid',
    gridTemplateColumns: '8rem 1fr',
    gridGap: '.3rem',
    '& > span': {
        border: '2px solid #24d76a',
        borderRadius: '1rem',
        textAlign: 'center',
        padding: '.2rem 0',
        margin: '.5rem 1rem .5rem 0',
    },
    '& > div': {
        margin: 'auto 0',
        fontSize: '.8rem',
        '& > span': {
            display: 'block',
        }
    }
});

const StyledNatureUpEffect = styled('span')({
    '&::after': {
        content: '" ▲▲"',
        color: '#ff6666',
    }
});
const StyledNatureDownEffect = styled('span')({
    '&::after': {
        content: '" ▼▼"',
        color: '#6666ff',
    }
});
const StyledUpEffectMenuItem = styled(MenuItem)({
    '& > div': {
        '& > div.up': {
            height: '1rem',
            fontSize: '1rem',
        },
        '& > div.natures': {
            height: '.6rem',
            '& >span': {
                paddingRight: '.8rem',
                color: '#888',
                fontSize: '.6rem',
            }
        },
    }
});

const NatureElement = React.memo(({value}: {value: Nature}) => {
    const { t } = useTranslation();

    if (value.upEffect === "No effect") {
        return <StyledNatureElement>
            <span>{t(`natures.${value.name}`)}</span>
            <div>{t('nature effect.No effect')}</div>
        </StyledNatureElement>;
    } else {
        return <StyledNatureElement>
            <span>{t(`natures.${value.name}`)}</span>
            <div>
                <StyledNatureUpEffect>{t(`nature effect.${value.upEffect}`)}</StyledNatureUpEffect>
                <StyledNatureDownEffect>{t(`nature effect.${value.downEffect}`)}</StyledNatureDownEffect>
            </div>
        </StyledNatureElement>;
    }    
});

export default NatureTextField;
