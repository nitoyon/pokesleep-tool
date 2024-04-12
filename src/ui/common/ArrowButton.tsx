import React from 'react';
import { styled } from '@mui/system';

const StyledArrowButton = styled('button')({
    width: '1.3rem',
    height: '1.3rem',
    background: 'white',
    fontSize: '.8rem',
    borderRadius: '50%',
    padding: 0,
    border: '1px solid #999',
    color: '#000',
    cursor: 'pointer',
    flexShrink: 0,
    position: 'relative',
    '&:hover': {
        background: '#f0f0ee',
    },
    '&:disabled': {
        background: '#eee',
        border: '1px solid #ccc',
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '1.3rem',
        height: '1.3rem',
        display: 'inline-block',
        borderRadius: '100%',
        overflow: 'hidden',
        background: '#999999',
        opacity: 0,
    }
});

interface ArrowButtonProps {
    /** button label */
    label:string;
    /** whether button is disabled */
    disabled:boolean;
    /** callback function when button is clicked */
    onClick: () => void;
}

const ArrowButton = React.memo(({disabled, label, onClick}:ArrowButtonProps) => {
    const onClickHandler = (event:React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        event.preventDefault();
        const elm = event.target as HTMLElement;
        elm.animate([
            { opacity: 0.5 },
            { opacity: 0, transform: "scale(3, 3)"}
        ],
        {
            duration: 200,
            easing: "ease-out",
            pseudoElement: "::before",
            iterations: 1
        });
        onClick?.();
    };

    return <StyledArrowButton disabled={disabled}
        onClick={onClickHandler}>{label}</StyledArrowButton>;
});

export default ArrowButton;
