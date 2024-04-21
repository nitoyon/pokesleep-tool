import { styled } from '@mui/system';
import { ButtonBase } from '@mui/material';

const TextLikeButton = styled(ButtonBase)({
    fontSize: '1rem',
    display: 'inline',
    textAlign: 'left',
    padding: 0,
    color: 'black',
    '&::before': {
        borderBottom: '1px solid rgba(0, 0, 0, 0.42)',
        content: '"\\00a0"',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    '&::after': {
        borderBottom: '2px solid #1976d2',
        content: '"\\00a0"',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        transform: 'scaleX(0)',
        transition: 'transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
    },
    '&:focus::after': {
        transform: 'scaleX(1)',
    },
    '&.focused::after': {
        transform: 'scaleX(1)',
    },
});

export default TextLikeButton;
