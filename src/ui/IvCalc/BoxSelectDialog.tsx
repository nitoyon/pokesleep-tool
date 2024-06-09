import React from 'react';
import { styled } from '@mui/system';
import BoxView from './BoxView';
import { IvAction } from './IvState';
import { PokemonBoxItem } from '../../util/PokemonBox';
import { Dialog }  from '@mui/material';

const BoxSelectDialog = React.memo(({items, open, onClose, onSelect}: {
    items: PokemonBoxItem[],
    open: boolean,
    onClose: () => void,
    onSelect: (item: PokemonBoxItem) => void,
}) => {
    const onChange = React.useCallback((action: IvAction) => {
        if (action.type === 'select') {
            const item = items.find(x => x.id === action.payload.id);
            if (item !== undefined) {
                onSelect(item);
                onClose();
            }
        }
    }, [items, onClose, onSelect]);
    return <StyledDialog open={open} onClose={onClose}>
        <BoxView items={items} selectedId={-1} selectMode
            onChange={onChange}/>
    </StyledDialog>;
});

const StyledDialog = styled(Dialog)({
    '& > div.MuiDialog-container > div.MuiPaper-root': {
        // extend dialog width
        width: '100%',
        margin: '20px',
    },
});

export default BoxSelectDialog;
