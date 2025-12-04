import React from 'react';
import { styled } from '@mui/system';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import { IconButton, Input, InputProps } from '@mui/material';
import PopperMenu from './PopperMenu';
import { formatWithComma, getFormatWithCommaPos } from '../../util/NumberUtil';

/**
 * Can use keyboard or not.
 */
const canUseKeyboard = window.matchMedia('(any-pointer: fine)').matches;

/** Props to omit from InputProps for NumericInput component. */
type OmitProps = 'inputProps' | 'onBlur' | 'onChange' | 'onFocus' | 'type' | 'value';

/**
 * Props for NumericInput component.
 */
type NumericInputProps = Omit<InputProps, OmitProps> & {
    min?: number,
    max?: number,
    value: number,
    onChange: (value: number) => void,
};

/**
 * An Input component that accepts numeric values and provides type-safe
 * onChange handling with number type instead of string.
 */
const NumericInput = React.memo(({min, max, value, onChange, ...props}: NumericInputProps) => {
    if (canUseKeyboard) {
        return <NumericInputKeyboard min={min} max={max} value={value}
            onChange={onChange} {...props}/>;
    } else {
        return <NumericInputTouch min={min} max={max} value={value}
            onChange={onChange} {...props}/>;
    }
});

/**
 * An numeric input component for keyboard.
 */
const NumericInputKeyboard = React.memo(({min, max, value, onChange, ...props}: NumericInputProps) => {
    const [focused, setFocused] = React.useState(false);
    const [rawText, setRawText] = React.useState(value.toString());

    const minValue = min ?? 0;
    const maxValue = max ?? Number.MAX_SAFE_INTEGER;

    const onChangeHandler = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value.replace(/,/g, "");
        setRawText(text);
        if (text === "") {
            onChange(Math.max(0, minValue));
            return;
        }

        const val = parseInt(text, 10);
        if (isNaN(val)) {
            return;
        }
        const clampedVal = Math.min(Math.max(val, minValue), maxValue);
        onChange(clampedVal);
    }, [minValue, maxValue, onChange]);

    const onFocus = React.useCallback(() => {
        setFocused(true);
        setRawText(value.toString());
    }, [value]);
    const onBlur = React.useCallback(() => {
        setFocused(false);
    }, []);

    const text = focused ? rawText : formatWithComma(value);

    return <div className="numeric keyboard">
        <Input {...props} type="tel"
            inputProps={{inputMode: "numeric"}}
            value={text}
            onChange={onChangeHandler}
            onFocus={onFocus}
            onBlur={onBlur}/>
    </div>;
});

/**
 * An numeric input component for touch device.
 */
const NumericInputTouch = React.memo(({min, max, value, onChange, ...props}: NumericInputProps) => {
    const [open, setOpen] = React.useState(false);
    const [isEmpty, setIsEmpty] = React.useState(false);
    const [cursorPos, setCursorPos] = React.useState(0);
    const anchorRef = React.useRef<HTMLElement>(null);
    const mirrorRef = React.useRef<HTMLSpanElement>(null);
    const [inputStyle, setInputStyle] = React.useState<React.CSSProperties>({});
    const [cursorOffset, setCursorOffset] = React.useState({x: 0, y: 0});

    const minValue = min ?? 0;
    const maxValue = max ?? Number.MAX_SAFE_INTEGER;

    // Extract input element's computed style and position when open
    React.useEffect(() => {
        if (!anchorRef.current) {
            return;
        }
        const inputElement = anchorRef.current.querySelector('input');
        if (!inputElement) {
            return;
        }

        const computed = window.getComputedStyle(inputElement);
        const containerRect = anchorRef.current.getBoundingClientRect();
        const inputRect = inputElement.getBoundingClientRect();
        setInputStyle({
            fontSize: computed.fontSize,
            fontFamily: computed.fontFamily,
            fontWeight: computed.fontWeight,
            fontStyle: computed.fontStyle,
            letterSpacing: computed.letterSpacing,
            lineHeight: computed.lineHeight,
            width: computed.width,
            height: parseFloat(computed.height ?? "10") - 2,
            padding: computed.padding,
            boxSizing: computed.boxSizing as React.CSSProperties['boxSizing'],
            transform: computed.transform,
            top: inputRect.top - containerRect.top,
            left: inputRect.left - containerRect.left,
        });
    }, []);

    // Calculate cursor position using Range API
    React.useEffect(() => {
        if (!(open && mirrorRef.current)) {
            return;
        }

        const textNode = mirrorRef.current.firstChild;
        if (textNode === null || textNode.nodeType !== Node.TEXT_NODE) {
            // Text is empty or not found
            setCursorOffset({x: 0, y: 0});
            return;
        }

        // Convert raw cursor position to display position (accounting for commas)
        const range = document.createRange();
        const displayText = isEmpty ? "" : formatWithComma(value);
        const displayPos = getFormatWithCommaPos(value, cursorPos);
        const offset = Math.min(displayPos, displayText.length);

        range.setStart(textNode, offset);
        range.setEnd(textNode, offset);

        const rect = range.getBoundingClientRect();
        const mirrorRect = mirrorRef.current.getBoundingClientRect();

        setCursorOffset({
            x: rect.left - mirrorRect.left,
            y: rect.top - mirrorRect.top,
        });
    }, [open, cursorPos, value, isEmpty]);

    const onClick = React.useCallback(() => {
        setIsEmpty(false);
        const text = value.toString();
        setCursorPos(text.length); // Set cursor at the end
        setOpen(true);
    }, [value]);

    const onClose = React.useCallback(() => {
        setIsEmpty(false);
        setOpen(false);
    }, []);

    const onDigitClick = React.useCallback((digit: number) => {
        setIsEmpty(false);
        const currentText = isEmpty ? "0" : value.toString();
        const digitStr = digit.toString();

        // Insert digit at cursor position
        let newText: string;
        if (currentText === "0") {
            newText = digitStr;
            setCursorPos(1);
        } else {
            newText = currentText.slice(0, cursorPos) + digitStr + currentText.slice(cursorPos);
            setCursorPos(cursorPos + 1);
        }

        let val = parseInt(newText, 10);
        if (isNaN(val)) {
            return;
        }
        val = Math.max(minValue, Math.min(val, maxValue));
        onChange(val);
        if (val === maxValue) {
            setCursorPos(val.toString().length);
        }
    }, [isEmpty, value, cursorPos, maxValue, minValue, onChange]);

    const onBackspaceClick = React.useCallback(() => {
        if (cursorPos === 0) {
            return; // Can't delete before the start
        }

        const currentText = value.toString();
        if (currentText.length <= 1 || isEmpty) {
            setIsEmpty(true);
            onChange(Math.max(0, minValue));
            setCursorPos(0);
        } else {
            // Delete character before cursor
            const newText = currentText.slice(0, cursorPos - 1) + currentText.slice(cursorPos);
            const val = parseInt(newText, 10);
            if (!isNaN(val)) {
                onChange(Math.max(val, minValue));
                setCursorPos(cursorPos - 1);
            }
        }
    }, [isEmpty, value, cursorPos, minValue, onChange]);

    const onClearClick = React.useCallback(() => {
        setIsEmpty(true);
        onChange(Math.max(0, minValue));
        setCursorPos(0);
    }, [minValue, onChange]);

    const onNavMove = React.useCallback((diff: number) => {
        const max = isEmpty ? 0 : value.toString().length;
        setCursorPos(Math.max(0, Math.min(max, cursorPos + diff)));
    }, [cursorPos, isEmpty, value]);

    // Use " " (space) to represent empty input to maintain input height
    const text = isEmpty ? " " : formatWithComma(value);

    return <>
        <StyledInputContainer className="numeric touch">
            <StyledInput {...props}
                ref={anchorRef} readOnly
                className={`${props.className ?? ""} ${open ? "focused" : ""}`}
                onClick={onClick}
                inputProps={{inputMode: "none"}}
                value={text}/>
            {open && (
                <>
                    <MirrorSpan ref={mirrorRef} style={inputStyle}>
                        {text}
                    </MirrorSpan>
                    <Cursor style={{
                        ...inputStyle,
                        left: (inputStyle.left ?? 0) as number + cursorOffset.x,
                        top: (inputStyle.top ?? 0) as number + cursorOffset.y,
                        width: '2px',
                        padding: 0,
                    }} />
                </>
            )}
        </StyledInputContainer>
        <PopperMenu open={open} anchorEl={anchorRef.current} onClose={onClose}>
            <div>
                <StyledNumpad>
                    <IconButton onClick={() => onDigitClick(1)}>1</IconButton>
                    <IconButton onClick={() => onDigitClick(2)}>2</IconButton>
                    <IconButton onClick={() => onDigitClick(3)}>3</IconButton>
                    <IconButton className="func" onClick={onBackspaceClick}><BackspaceOutlinedIcon/></IconButton>
                    <IconButton onClick={() => onDigitClick(4)}>4</IconButton>
                    <IconButton onClick={() => onDigitClick(5)}>5</IconButton>
                    <IconButton onClick={() => onDigitClick(6)}>6</IconButton>
                    <IconButton className="close" onClick={onClearClick}><CancelIcon/></IconButton>
                    <IconButton onClick={() => onDigitClick(7)}>7</IconButton>
                    <IconButton onClick={() => onDigitClick(8)}>8</IconButton>
                    <IconButton onClick={() => onDigitClick(9)}>9</IconButton>
                    <IconButton className="ok" onClick={onClose}><SubdirectoryArrowLeftIcon/></IconButton>
                    <IconButton className="nav" onClick={() => onNavMove(-1)}><ArrowBackOutlinedIcon/></IconButton>
                    <IconButton onClick={() => onDigitClick(0)}>0</IconButton>
                    <IconButton className="nav" onClick={() => onNavMove(1)}><ArrowForwardOutlinedIcon/></IconButton>
                </StyledNumpad>
            </div>
        </PopperMenu>
    </>;
});

const StyledInputContainer = styled('div')({
    position: 'relative',
    display: 'inline',
});

const StyledInput = styled(Input)({
    '&.focused:after': {
        transform: 'scaleX(1)',
    },
});

const StyledNumpad = styled('div')({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    padding: '0.6rem',
    gap: '0.4rem',
    '& > button': {
        width: '4.3rem',
        height: '3rem',
        borderRadius: '1rem',
        touchAction: 'manipulation',
        fontFamily: 'inherit',
        '&, &:hover, &:focus, &:active': {
            background: '#ddd',
        },
    },
    '& > .close': {
        color: '#fff',
        '&, &:hover, &:focus, &:active': {
            background: '#d32f2f',
        },
    },
    '& > .func': {
        color: '#fff',
        '&, &:hover, &:focus, &:active': {
            background: '#ff944b',
        },
    },
    '& > .nav': {
        color: '#fff',
        '&, &:hover, &:focus, &:active': {
            background: '#c6e55e',
        },
    },
    '& > .ok': {
        '&, &:hover, &:focus, &:active': {
            background: '#1976d2',
        },
        color: '#fff',
        gridRow: '3 / span 2',
        gridColumn: '4',
        height: '6.4rem',
        borderRadius: '1rem',
    },
});

const MirrorSpan = styled('span')({
    position: 'absolute',
    pointerEvents: 'none',
    visibility: 'hidden',
    whiteSpace: 'pre',
});

const Cursor = styled('span')({
    position: 'absolute',
    width: '2px',
    backgroundColor: '#1976d2',
    pointerEvents: 'none',
    animation: 'blink 1s step-end infinite',
    '@keyframes blink': {
        '0%, 70%': {
            opacity: 1,
        },
        '75%, 95%': {
            opacity: 0,
        },
    },
});

export default NumericInput;
