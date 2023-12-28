import React from 'react';

interface ArrowButtonProps {
    /** button label */
    label:string;
    /** whether button is disabled */
    disabled:boolean;
    /** callback function when button is clicked */
    onClick: () => void;
}

export default function ArrowButton({disabled, label, onClick}:ArrowButtonProps) {
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

    return <button className="rank_move" disabled={disabled}
        onClick={onClickHandler}>{label}</button>;
};

