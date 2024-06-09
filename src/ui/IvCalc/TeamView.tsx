import React from 'react';
import { styled } from '@mui/system';
import { IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import OutboxIcon from '@mui/icons-material/Outbox';
import { useTranslation } from 'react-i18next';

const TeamView = React.memo(() => {
    const { t } = useTranslation();

    return (<StyledTeamView>
        <EmptyMember/>
        <EmptyMember/>
        <EmptyMember/>
        <EmptyMember/>
        <EmptyMember/>
    </StyledTeamView>);
});

const StyledTeamView = styled('div')({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
    gridGap: '.3rem',
});

const EmptyMember = React.memo(() => {
    return (<StyledEmptyMember>
        <IconButton>
            <OutboxIcon/>
        </IconButton>
        <IconButton>
            <AddCircleOutlineIcon/>
        </IconButton>
    </StyledEmptyMember>);
});

const StyledEmptyMember = styled('div')({
    border: '1px solid #aaa',
    borderRadius: '10px',
});

export default TeamView;
