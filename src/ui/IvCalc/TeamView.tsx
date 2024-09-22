import React from 'react';
import { styled } from '@mui/system';
import { PokemonBoxItem } from '../../util/PokemonBox';
import PokemonIv from '../../util/PokemonIv';
import IvState, { IvAction } from './IvState';
import BoxSelectDialog from './BoxSelectDialog';
import PokemonIcon from './PokemonIcon';
import { IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import OutboxIcon from '@mui/icons-material/Outbox';
import { useTranslation } from 'react-i18next';

const TeamView = React.memo(({state, dispatch}: {
    state: IvState,
    dispatch: (action: IvAction) => void,
}) => {
    const [members, setMembers] = React.useState<(PokemonIv|undefined)[]>([
        undefined, undefined, undefined, undefined, undefined]);
    const [boxDialogOpen, setBoxDialogOpen] = React.useState(false);
    const [editingIndex, setEditingIndex] = React.useState(-1);

    const onBoxClick = React.useCallback((index: number) => {
        setEditingIndex(index);
        setBoxDialogOpen(true);
    }, []);
    
    const onBoxDialogClose = React.useCallback(() => {
        setBoxDialogOpen(false);
    }, []);

    const onBoxSelect = React.useCallback((item: PokemonBoxItem) => {
        setMembers(members.map((x, index) => {
            return editingIndex !== index ? x : item.iv
        }));
    }, [editingIndex, members]);

    return (<StyledTeamView>
        <MemberBox index={0} iv={members[0]} onBoxClick={onBoxClick}/>
        <MemberBox index={1} iv={members[1]} onBoxClick={onBoxClick}/>
        <MemberBox index={2} iv={members[2]} onBoxClick={onBoxClick}/>
        <MemberBox index={3} iv={members[3]} onBoxClick={onBoxClick}/>
        <MemberBox index={4} iv={members[4]} onBoxClick={onBoxClick}/>
        <BoxSelectDialog open={boxDialogOpen} items={state.box.items}
            parameter={state.parameter} dispatch={dispatch}
            onClose={onBoxDialogClose} onSelect={onBoxSelect}/>
    </StyledTeamView>);
});

const StyledTeamView = styled('div')({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
    gridGap: '.3rem',
});

const MemberBox = React.memo(({index, iv, onBoxClick}: {
    index: number,
    iv?: PokemonIv,
    onBoxClick: (index: number) => void,
}) => {
    if (iv === undefined) {
        return <EmptyMemberBox index={index} onBoxClick={onBoxClick}/>
    }
    else {
        return <ValidMemberBox iv={iv}/>;
    }
});

const EmptyMemberBox = React.memo(({index, onBoxClick}: {
    index: number,
    onBoxClick: (index: number) => void,
}) => {
    const onBoxClickHandler = React.useCallback(() => {
        onBoxClick(index);
    }, [index, onBoxClick]);

    return (<StyledEmptyMember>
        <IconButton onClick={onBoxClickHandler}>
            <OutboxIcon/>
        </IconButton>
    </StyledEmptyMember>);
});

const ValidMemberBox = React.memo(({iv}: {
    iv: PokemonIv,
}) => {
    const { t } = useTranslation();

    return <StyledEmptyMember>
        <div className="icon">
            <header><span className="lv">Lv.</span>{iv.level}</header>
            <PokemonIcon id={iv.pokemon.id} size={32}/>
            <footer>{t(`pokemons.${iv.pokemonName}`)}</footer>
        </div>
    </StyledEmptyMember>;
});

const StyledEmptyMember = styled('div')({
    border: '1px solid #aaa',
    borderRadius: '10px',
    '& > div.icon': {
        textAlign: 'center',
        '& > header': {
            fontSize: '0.7rem',
            fontWeight: 'bold',
            '& > span.lv': {
                color: '#62d540',
                fontSize: '0.6rem',
                paddingRight: '0.2rem',
            },
        },
        '& > div': {
            margin: '0.1rem auto 0.1rem',
        },
        '& > footer': {
            fontSize: '0.7rem',
            color: '#666666',
            overflowWrap: 'anywhere',
        },
    },
});

export default TeamView;
