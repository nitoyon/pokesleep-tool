import React from 'react';
import { styled } from '@mui/system';
import { maxLevel } from '../../../util/PokemonRp';
import LevelControl from './LevelControl';
import PopperMenu from '../../common/PopperMenu';
import TextLikeButton from '../../common/TextLikeButton';
import { Button } from '@mui/material';

const LevelSelector = React.memo(({ value, onChange }: {
    value: number,
    onChange: (value: number) => void
}) => {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);

    const onClick = React.useCallback(() => {
        setOpen(true);
    }, []);
    const onClose = React.useCallback(() => {
        setOpen(false);
    }, []);
    const onButtonClick = React.useCallback((num: number) => {
        setOpen(false);
        onChange(num);
    }, [onChange]);

    return (<>
        <TextLikeButton ref={anchorRef} onClick={onClick}
            className={open ? "focused" : ""}>
            {value}
        </TextLikeButton>
        <PopperMenu anchorEl={anchorRef.current} open={open} onClose={onClose}>
            <LevelSelectorPopup style={{width: '10rem'}}>
                <LevelControl max={maxLevel} hideInput value={value} onChange={onChange}/>
                <div className="buttons">
                    <Button onClick={() => onButtonClick(10)}>10</Button>
                    <Button onClick={() => onButtonClick(25)}>25</Button>
                    <Button onClick={() => onButtonClick(30)}>30</Button>
                    <Button onClick={() => onButtonClick(40)}>40</Button>
                    <Button onClick={() => onButtonClick(50)}>50</Button>
                    <Button onClick={() => onButtonClick(60)}>60</Button>
                    <Button onClick={() => onButtonClick(65)}>65</Button>
                </div>
            </LevelSelectorPopup>
        </PopperMenu>
    </>);
});

const LevelSelectorPopup = styled('div')({
    width: '10rem',
    padding: '.3rem .7rem',
    '& > div.buttons': {
        paddingTop: '.4rem',
        marginLeft: '-0.2rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.3rem 0.5rem',
        '& > button': {
            color: '#79d073',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            padding: 0,
            width: '1.5rem',
            height: '1.5rem',
            minWidth: '1.5rem',
            minHeight: '1.5rem',
            borderRadius: '50%',
            border: '1.5px solid #79d073',
        },
    }
});

export default LevelSelector;
