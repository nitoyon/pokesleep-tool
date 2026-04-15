import React from 'react';
import { styled } from '@mui/system';
import { Button } from '@mui/material';
import TextLikeButton from '../../common/TextLikeButton';
import PopperMenu from '../../common/PopperMenu';
import SliderAndArrow from '../../common/SliderAndArrow';
import { AlwaysTap, NoTap } from '../../../util/Energy';
import { useTranslation } from 'react-i18next';

const TapFrequencyControl = React.memo(({max, title, value, onChange, sx}: {
    max: number,
    title?: string,
    value: number,
    onChange: (value: number) => void,
    sx?: React.CSSProperties,
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
        onChange(val === 0 ? AlwaysTap :
            val === max * 2 + 1 ? NoTap : val * 30);
    }, [onChange, max]);
    const onButtonClick = React.useCallback((val: number) => {
        onChange(val);
        setOpen(false);
    }, [onChange]);

    const valueText = (
        value === 0 ? t('none') :
        value === 1 ? t('every minute') :
        t('hour2', {count: value / 60}));

    // value === NoTap: Right side (max * 2 + 1)
    // value === AlwaysTap: Left side (0)
    // others: 0.5 hours -> 1, 1 hour -> 2, ...
    const sliderVal = value === NoTap ? (max * 2 + 1) :
        value === AlwaysTap ? 0 :
        Math.floor(value / 30);

    return (<>
        <TextLikeButton ref={anchorRef} onClick={onClick}
            sx={sx ?? {padding: '0 4px'}}
            className={open ? "focused" : ""}>
            {valueText}
        </TextLikeButton>
        <PopperMenu anchorEl={anchorRef.current} open={open} onClose={onClose}
            placement="bottom-end"
        >
            <StyledMenuDiv>
                {title && <header>{title}</header>}
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
    '& > header': {
        fontSize: '0.9rem',
        paddingBottom: '0.4rem',
        color: '#666',
    },
    '& > div > button': {
        textTransform: 'none',
        color: '#000',
    },
});

export default TapFrequencyControl;
