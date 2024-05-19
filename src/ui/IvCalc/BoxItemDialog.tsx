import React from 'react';
import { styled } from '@mui/system';
import IvForm from './IvForm';
import RpLabel from './RpLabel';
import PokemonIcon from './PokemonIcon';
import { PokemonBoxItem } from '../../util/PokemonBox';
import PokemonIv from '../../util/PokemonIv';
import PokemonRp from '../../util/PokemonRp';
import { Button, Dialog, DialogActions, TextField }  from '@mui/material';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { useTranslation } from 'react-i18next'

// Full-screen transition
// https://mui.com/material-ui/react-dialog/#full-screen-dialogs
const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const BoxItemEditDialog = React.memo(({open, boxItem, isEdit, onClose, onChange}: {
    open: boolean,
    boxItem: PokemonBoxItem|null,
    isEdit: boolean,
    onClose: () => void,
    onChange: (value: PokemonBoxItem) => void,
}) => {
    if (!isEdit) {
        boxItem = new PokemonBoxItem(new PokemonIv("Venusaur"), undefined, -1);
    }
    if (boxItem === null) {
        return <></>;
    }
    return <StyledDialog open={open} onClose={onClose} fullScreen
        TransitionComponent={Transition}>
        <BoxItemDialogContent originalBoxItem={boxItem} isEdit={isEdit}
            onClose={onClose} onChange={onChange}/>
    </StyledDialog>;
});

const BoxItemDialogContent = React.memo(({originalBoxItem, isEdit, onChange, onClose}: {
    originalBoxItem: PokemonBoxItem,
    isEdit: boolean,
    onChange: (value: PokemonBoxItem) => void,
    onClose: () => void,
}) => {
    const { t } = useTranslation();
    const [boxItem, setBoxItem] = React.useState<PokemonBoxItem>(originalBoxItem);
    const [nickname, setNickname] = React.useState<string>(originalBoxItem.nickname);
    const [rp, setRp] = React.useState<number>(new PokemonRp(boxItem.iv).calculate().rp);
    const [isEditingNickName, setIsEditingNickName] = React.useState(false);
    const localName = t(`pokemons.${boxItem.iv.pokemonName}`);

    const onFormChange = React.useCallback((value: PokemonIv) => {
        setBoxItem(new PokemonBoxItem(value, boxItem.nickname, boxItem.id));
        setRp(new PokemonRp(value).calculate().rp);
        if (nickname === localName) {
            setNickname("");
        }
    }, [setBoxItem, boxItem, setRp, localName, nickname]);
    const onNickNameChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setNickname(event.target.value);
    }, [setNickname]);
    const onNickNameFocus = React.useCallback((e: any) => {
        setIsEditingNickName(true);
        if (nickname === "") {
            setNickname(localName);
        }
    }, [setIsEditingNickName, setNickname, nickname, localName]);
    const onNickNameBlur = React.useCallback((e: any) => {
        setIsEditingNickName(false);
        if (nickname === localName) {
            setNickname("");
        }
    }, [setNickname, setIsEditingNickName, nickname, localName]);

    const onCloseClick = React.useCallback(() => {
        if (isEdit) {
            onChange(new PokemonBoxItem(boxItem.iv, nickname, boxItem.id));
        }
        onClose();
    }, [isEdit, onChange, onClose, boxItem, nickname]);
    const onSaveClick = React.useCallback(() => {
        if (!isEdit) {
            onChange(new PokemonBoxItem(boxItem.iv, nickname, boxItem.id));
        }
        onClose();
    }, [isEdit, onChange, onClose, boxItem, nickname]);

    let displayNickName = nickname;
    if (!isEditingNickName && nickname === "") {
        displayNickName = t(`pokemons.${boxItem.iv.pokemonName}`);
    }

    return <>
        <article>
            <RpLabel rp={rp}/>
            <div className="icon"><PokemonIcon id={boxItem.iv.pokemon.id} size={80}/></div>
            <div className="nickname">
                <TextField variant="standard" size="small" value={displayNickName}
                    onChange={onNickNameChange}
                    onFocus={onNickNameFocus}
                    onBlur={onNickNameBlur}/>
            </div>
            <IvForm pokemonIv={boxItem.iv} fixMode={isEdit} onChange={onFormChange}/>
        </article>
        <DialogActions>
            <Button onClick={onCloseClick}>{t('close')}</Button>
            {!isEdit && <Button onClick={onSaveClick}>{t('add')}</Button>}
        </DialogActions>
    </>;
});

const StyledDialog = styled(Dialog)({
    '& div.MuiDialog-paper': {
        '& > article': {
            padding: '.5rem .5rem 0 .5rem',
            flex: 1,

            '& > div.icon': {
                margin: '.2rem auto',
                width: '82px',
            },
            '& > div.nickname': {
                margin: '0 auto 1.2rem auto',
                width: '10rem',
                '& input': {
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                },
            },
        },
        '& > div.MuiDialogActions-root': {
            marginBottom: '1rem',
        }
    },
});

export default BoxItemEditDialog;
