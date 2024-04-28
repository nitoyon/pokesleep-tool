import React from 'react';
import { IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { styled } from '@mui/system';

const StyledIconButton = styled(IconButton)({
    '&': {
        padding: 0,
        marginLeft: '6px',
        '& > svg': {
            width: '20px',
            height: '20px',
            color: '#bbb',
        },
    },
});

const InfoButton = React.memo(({onClick}: {onClick: () => void}) => {
    return (
        <StyledIconButton onClick={onClick}>
            <InfoOutlinedIcon/>
        </StyledIconButton>
    );
});

export default InfoButton;
