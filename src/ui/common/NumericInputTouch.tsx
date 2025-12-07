import React from 'react';
import { styled } from '@mui/system';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import { Divider, IconButton, Input } from '@mui/material';
import PopperMenu from './PopperMenu';
import { NumericInputHandle, NumericInputProps } from './NumericInput';
import { formatWithComma, getFormatWithCommaPos } from '../../util/NumberUtil';

/**
 * An numeric input component for touch device.
 */
const NumericInputTouch = React.memo(React.forwardRef<NumericInputHandle, NumericInputProps>(
    ({children, min, max, value, onChange, ...props}, ref) => {
    const [open, setOpen] = React.useState(false);
    const [isEmpty, setIsEmpty] = React.useState(false);
    const [cursorPos, setCursorPos] = React.useState(0);
    const anchorRef = React.useRef<HTMLElement>(null);
    const mirrorRef = React.useRef<HTMLSpanElement>(null);
    const [inputStyle, setInputStyle] = React.useState<React.CSSProperties>({});
    const [cursorOffset, setCursorOffset] = React.useState({x: 0, y: 0});

    const minValue = min ?? 0;
    const maxValue = max ?? Number.MAX_SAFE_INTEGER;

    // Use refs to always have access to the latest values.
    // This is necessary to handle rapid consecutive taps on touch devices.
    // Without refs, the callbacks would capture stale values from their closures,
    // causing tap events to be dropped or processed incorrectly during rapid input.
    const valueRef = React.useRef(value);
    const cursorPosRef = React.useRef(cursorPos);
    const isEmptyRef = React.useRef(isEmpty);

    // Keep refs in sync with state
    React.useEffect(() => {
        valueRef.current = value;
        cursorPosRef.current = cursorPos;
        isEmptyRef.current = isEmpty;
    }, [value, cursorPos, isEmpty]);

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

    const onClick = React.useCallback((e: React.MouseEvent<HTMLInputElement>) => {
        setIsEmpty(false);
        const text = formatWithComma(value);

        // First time open or mirror not ready, set cursor to end
        if (!(open && mirrorRef.current)) {
            setCursorPos(text.length);
            setOpen(true);
            return;
        }

        // Find text node
        const textNode = mirrorRef.current.firstChild;
        if (textNode === null || textNode.nodeType !== Node.TEXT_NODE) {
            setCursorPos(text.length);
            setOpen(true);
            return;
        }

        // Find the character position closest to the click using Range API
        const clickX = e.clientX;
        const range = document.createRange();
        let closestPos = text.length;
        let minDistance = Infinity;

        for (let i = 0; i <= text.length; i++) {
            range.setStart(textNode, 0);
            range.setEnd(textNode, i);
            const rect = range.getBoundingClientRect();
            const distance = Math.abs(clickX - rect.right);

            if (distance < minDistance) {
                minDistance = distance;
                // Convert display position to raw position (remove commas)
                const rawPos = text.substring(0, i).replace(/,/g, '').length;
                closestPos = rawPos;
            }
        }

        setCursorPos(closestPos);
        setOpen(true);
    }, [open, value]);

    const onClose = React.useCallback(() => {
        setIsEmpty(false);
        setOpen(false);
    }, []);

    // Expose focus and close methods to parent via ref
    React.useImperativeHandle(ref, () => ({
        focus: () => {
            if (!open) {
                setIsEmpty(false);
                setCursorPos(value.toString().length);
                setOpen(true);
            }
            anchorRef.current?.querySelector('input')?.focus();
        },
        close: onClose
    }), [onClose, open, value]);

    const onDigitClick = React.useCallback((digit: number) => {
        setIsEmpty(false);
        const currentText = isEmptyRef.current ? "0" : valueRef.current.toString();
        const currentCursorPos = cursorPosRef.current;
        const digitStr = digit.toString();

        // Insert digit at cursor position
        let newText: string;
        if (currentText === "0") {
            newText = digitStr;
            setCursorPos(1);
        } else {
            newText = currentText.slice(0, currentCursorPos) + digitStr + currentText.slice(currentCursorPos);
            setCursorPos(currentCursorPos + 1);
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
    }, [maxValue, minValue, onChange]);

    const onBackspaceClick = React.useCallback(() => {
        const currentCursorPos = cursorPosRef.current;
        if (currentCursorPos === 0) {
            return; // Can't delete before the start
        }

        const currentText = valueRef.current.toString();
        const currentIsEmpty = isEmptyRef.current;
        if (currentText.length <= 1 || currentIsEmpty) {
            setIsEmpty(true);
            onChange(Math.max(0, minValue));
            setCursorPos(0);
        } else {
            // Delete character before cursor
            const newText = currentText.slice(0, currentCursorPos - 1) + currentText.slice(currentCursorPos);
            const val = parseInt(newText, 10);
            if (!isNaN(val)) {
                onChange(Math.max(val, minValue));
                setCursorPos(currentCursorPos - 1);
            }
        }
    }, [minValue, onChange]);

    const onClearClick = React.useCallback(() => {
        setIsEmpty(true);
        onChange(Math.max(0, minValue));
        setCursorPos(0);
    }, [minValue, onChange]);

    const onNavMove = React.useCallback((diff: number) => {
        const max = isEmptyRef.current ? 0 : valueRef.current.toString().length;
        const currentCursorPos = cursorPosRef.current;
        setCursorPos(Math.max(0, Math.min(max, currentCursorPos + diff)));
    }, []);

    const onKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle digit keys (0-9)
        if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            onDigitClick(parseInt(e.key, 10));
            return;
        }

        // Handle Backspace
        if (e.key === 'Backspace') {
            e.preventDefault();
            onBackspaceClick();
            return;
        }

        // Handle Delete (forward delete)
        if (e.key === 'Delete') {
            e.preventDefault();
            const currentCursorPos = cursorPosRef.current;
            const currentText = valueRef.current.toString();
            const currentIsEmpty = isEmptyRef.current;

            if (currentCursorPos >= currentText.length) {
                return; // Can't delete after the end
            }

            if (currentText.length === 1 || currentIsEmpty) {
                setIsEmpty(true);
                onChange(Math.max(0, minValue));
                setCursorPos(0);
            } else {
                // Delete character at cursor position
                const newText = currentText.slice(0, currentCursorPos) + currentText.slice(currentCursorPos + 1);
                const val = parseInt(newText, 10);
                if (!isNaN(val)) {
                    onChange(Math.max(val, minValue));
                }
            }
            return;
        }

        // Handle Arrow Left
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            onNavMove(-1);
            return;
        }

        // Handle Arrow Right
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            onNavMove(1);
            return;
        }

        // Handle Home (move cursor to start)
        if (e.key === 'Home') {
            e.preventDefault();
            setCursorPos(0);
            return;
        }

        // Handle End (move cursor to end)
        if (e.key === 'End') {
            e.preventDefault();
            const max = isEmptyRef.current ? 0 : valueRef.current.toString().length;
            setCursorPos(max);
            return;
        }

        // Handle Enter or Escape to close
        if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault();
            onClose();
            return;
        }
    }, [onDigitClick, onBackspaceClick, onNavMove, onClose, minValue, onChange, setIsEmpty, setCursorPos]);

    // Use " " (space) to represent empty input to maintain input height
    const text = isEmpty ? " " : formatWithComma(value);

    return <>
        <StyledInputContainer className="numeric touch">
            <StyledInput {...props}
                ref={anchorRef} readOnly
                className={`${props.className ?? ""} ${open ? "focused" : ""}`}
                onClick={onClick}
                onKeyDown={onKeyDown}
                inputProps={{inputMode: "none"}}
                value={text}/>
            <MirrorSpan ref={mirrorRef} style={inputStyle}>
                {text}
            </MirrorSpan>
            {open && (
                <>
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
                {children && <>
                    {children}
                    <Divider/>
                </>}
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
}));

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

export default NumericInputTouch;
