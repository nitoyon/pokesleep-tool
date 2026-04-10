import React from 'react';
import { styled } from '@mui/system';
import { Button } from '@mui/material';
import TextLikeButton from '../../common/TextLikeButton';
import PopperMenu from '../../common/PopperMenu';
import SliderAndArrow from '../../common/SliderAndArrow';
import { useTranslation } from 'react-i18next';

const TapFrequencyControl = React.memo(({max, value, onChange}: {
    max: number,
    value: number,
    onChange: (value: number) => void,
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const onClick = React.useCallback(() => {
        setOpen(true);
    }, []);
    const onClose = React.useCallback(() => {
        setOpen(false);
    }, []);
    const onSliderChange = React.useCallback((val: number) => {
        // Convert sliderVal to value
        onChange(val === 0 ? 1 :
            val === max * 2 + 1 ? 0 : val * 30);
    }, [onChange]);
    const onButtonClick = React.useCallback((val: number) => {
        onChange(val);
        setOpen(false);
    }, [onChange]);

    const valueText = (
        value === 0 ? t('none') :
        value === 1 ? t('every minute') :
        t('hour2', {count: value / 60}));

    // value === 0: Right side (max * 2 + 1)
    // value === 1: Left side (0)
    // others: 0.5 hours -> 1, 1 hour -> 2, ...
    const sliderVal = value === 0 ? (max * 2 + 1) :
        Math.floor(value / 30);

    return (<>
        <TextLikeButton ref={anchorRef} onClick={onClick}
            sx={{padding: '0 0.4rem'}}
            className={open ? "focused" : ""}>
            {valueText}
        </TextLikeButton>
        <PopperMenu anchorEl={anchorRef.current} open={open} onClose={onClose}>
            <StyledMenuDiv>
                <SliderAndArrow min={0} max={max * 2 + 1} value={sliderVal} onChange={onSliderChange}/>
                <div className="buttons">
                    <Button onClick={() => onButtonClick(1)}>{t('every minute')}</Button>
                    <Button onClick={() => onButtonClick(0)}>{t('none')}</Button>
                </div>
            </StyledMenuDiv>
        </PopperMenu>
    </>);
});

const StyledMenuDiv = styled('div')({
    padding: '0.4rem',
    minWidth: '12rem',
    '& > div > button': {
        textTransform: 'none',
        color: '#000',
    },
});

export default TapFrequencyControl;
