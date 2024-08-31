import React from 'react';
import { styled } from '@mui/system';
import PokemonIv from '../../util/PokemonIv';
import { MenuList, MenuItem } from '@mui/material';
import PopperMenu from '../common/PopperMenu';
import TextLikeButton from '../common/TextLikeButton';
import { useTranslation } from 'react-i18next';

const CarryLimitTextField = React.memo(({iv, onChange}: {
    iv: PokemonIv,
    onChange: (evolvedCount: 0|1|2) => void,
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

    if (iv.pokemon.evolutionCount <= 0) {
        return <span style={{paddingBottom: '3px'}}>{iv.carryLimit}</span>;
    }
  
    return <>
            <TextLikeButton ref={anchorRef} onClick={onClick}
                className={open ? "focused" : ""}
                style={{width: '2.5rem', fontSize: '0.9rem'}}>
                {iv.carryLimit}
            </TextLikeButton>
            <CarryLimitPopper open={open} anchorRef={anchorRef}
                iv={iv} onClose={onClose} onChange={onChange}/>
    </>;
});

const CarryLimitPopper = React.memo(({open, anchorRef, iv, onClose, onChange}: {
    open: boolean,
    anchorRef: React.RefObject<HTMLButtonElement>,
    iv: PokemonIv,
    onClose: () => void,
    onChange: (evolvedCount: 0|1|2) => void,
}) => {
    const { t } = useTranslation();

    const onClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
        const val = event.currentTarget.getAttribute('value');
        if (val === null) { return; }
        onClose();
        onChange(parseInt(val) as 0|1|2);
    }, [onChange, onClose]);

    let menuItems: React.ReactNode[] = [];
    const inventory = iv.ribbonCarryLimit +
        iv.subSkills.getActiveSubSkills(iv.level).reduce((p, c) => p + c.inventory, 0) * 6;
    for (let i = 0; i <= iv.pokemon.evolutionCount; i++) {
        const val = iv.pokemon.evolutionCount - i;
        const carry = iv.pokemon.carryLimit + 5 * val + inventory;
        let desc = "";
        switch (val) {
            case 0: desc = t('not evolved'); break;
            case 1: desc = t('evolved once'); break;
            case 2: desc = t('evolved twice'); break;
        }
        menuItems.push(<CarryLimitMenuItem key={val} value={val} dense
            selected={val === iv.evolvedCount} onClick={onClick} >
            {carry}
            <span>({desc})</span>
        </CarryLimitMenuItem>);
    }

    return (
        <PopperMenu open={open} onClose={onClose} anchorEl={anchorRef.current}>
            <MenuList>
                {menuItems}
            </MenuList>
        </PopperMenu>
    );
});

const CarryLimitMenuItem = styled(MenuItem)({
    '& > span': {
        paddingLeft: '0.8rem',
        fontSize: '0.8rem',
        color: '#999',
    },
});

export default CarryLimitTextField;
