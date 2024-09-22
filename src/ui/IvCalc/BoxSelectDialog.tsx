import React from 'react';
import { styled } from '@mui/system';
import BoxView from './BoxView';
import { IvAction } from './IvState';
import { PokemonBoxItem } from '../../util/PokemonBox';
import { StrengthParameter } from '../../util/PokemonStrength';
import { Dialog }  from '@mui/material';

const BoxSelectDialog = React.memo(({items, parameter, open, dispatch, onClose, onSelect}: {
    items: PokemonBoxItem[],
    parameter: StrengthParameter,
    open: boolean,
    dispatch: (action: IvAction) => void,
    onClose: () => void,
    onSelect: (item: PokemonBoxItem) => void,
}) => {
    const dispatchHook = React.useCallback((action: IvAction) => {
        if (action.type !== 'select') {
            dispatch(action);
            return;
        }

        // Hook select action
        const item = items.find(x => x.id === action.payload.id);
        if (item !== undefined) {
            onSelect(item);
            onClose();
        }
    }, [dispatch, items, onClose, onSelect]);

return <StyledDialog open={open} onClose={onClose}>
        <BoxView items={items} parameter={parameter} selectedId={-1} selectMode
            dispatch={dispatchHook}/>
    </StyledDialog>;
});

const StyledDialog = styled(Dialog)({
    '& > div.MuiDialog-container > div.MuiPaper-root': {
        // extend dialog width
        width: '100%',
        maxHeight: 'min(800px, 80%)',
        margin: '20px',
        position: 'relative',
    },
});

export default BoxSelectDialog;
