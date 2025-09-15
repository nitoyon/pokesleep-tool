import React from 'react';
import { styled } from '@mui/system';
import { motion, useMotionValue, useMotionValueEvent, PanInfo } from 'motion/react';
import IvForm from '../IvForm/IvForm';
import RpLabel from '../Rp/RpLabel';
import PokemonIcon from '../PokemonIcon';
import { PokemonBoxItem } from '../../../util/PokemonBox';
import PokemonIv from '../../../util/PokemonIv';
import PokemonRp from '../../../util/PokemonRp';
import { Button, Dialog, DialogActions, TextField }  from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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

const BoxItemDialog = React.memo(({open, boxItem, isEdit, onClose, onChange}: {
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
        <DragContainer>
            <RpLabel rp={rp} iv={boxItem.iv}/>
            <div className="icon"><PokemonIcon idForm={boxItem.iv.idForm} size={80}/></div>
            <div className="icon"><PokemonIcon idForm={boxItem.iv.idForm} size={80}/></div>
            <div className="icon"><PokemonIcon idForm={boxItem.iv.idForm} size={80}/></div>
            <div className="nickname">
                <TextField variant="standard" size="small" value={displayNickName}
                    onChange={onNickNameChange}
                    onFocus={onNickNameFocus}
                    onBlur={onNickNameBlur}/>
            </div>
            <IvForm pokemonIv={boxItem.iv} fixMode={isEdit} onChange={onFormChange}/>
        </DragContainer>
        <DialogActions>
            <Button onClick={onCloseClick}>{t('close')}</Button>
            {!isEdit && <Button onClick={onSaveClick}>{t('add')}</Button>}
        </DialogActions>
    </>;
});

// @use-gesture
// Swiper https://qiita.com/akane2726/items/12caac830f894b9baa8c
const DragContainer = React.memo(({children}: {
    children: React.ReactNode|React.ReactNode[],
}) => {
    const y = useMotionValue(0);
    const [scrollY, setScrollY] = React.useState(0);
    const [constraintY, setConstraintY] = React.useState(0);
    const parentRef = React.useRef<HTMLDivElement|null>(null);
    const containerRef = React.useRef<HTMLDivElement|null>(null);

    React.useEffect(() => {
        const handler = () => {
            if (containerRef.current === null) {
                return;
            }
            setConstraintY(Math.max(0,
                containerRef.current.clientHeight - window.innerHeight));
        };
        handler();

        window.addEventListener("resize", handler);
        return () => {
            window.removeEventListener("resize", handler);
        };
        //parentRef.current = containerRef.current.parentElement as HTMLDivElement;
        //console.log(containerRef.current, parentRef.current);
    }, []);

    const onDrag = React.useCallback((event: MouseEvent|TouchEvent|PointerEvent, info: PanInfo) => {
        /*if (y.get() < 0) {
            y.set(0);
        }*/
    }, []);
    useMotionValueEvent(y, "change", (val: number) => {
        if (containerRef.current === null) {
            return;
        }
        const parentContainer = containerRef.current.closest(".MuiPaper-root");
        if (parentContainer === null) {
            return;
        }
        const beforeY = y.get();
        if (parentContainer.scrollTop > 0 ||
            parentContainer.scrollTop === 0 && y.get() < 0
        ) {
            //parentContainer.scrollTo({ top: parentContainer.scrollTop - y.get() });
            //y.set(0);
        }
        console.log("scroll", parentContainer.scrollTop, y.get(), beforeY);
    });
    /*const onTouchMove = React.useCallback((e: React.TouchEvent) => {
        const currentY = e.touches[0].clientY;
        const delta = currentY - touchStartY.current;
        if (parentRef.current === null) {
            return;
        }
        console.log("move", delta, touchStartY.current, parentRef.current.scrollTop);
    }, []);*/
//
    return <>
        <button className="close"><CloseIcon/></button>
        <motion.div ref={containerRef}
            style={{y}}
            drag="y"
            dragConstraints={{top: -constraintY, bottom: 0}}
            onDrag={onDrag}
        >
            {children}
        </motion.div>
    </>;
});

const StyledDialog = styled(Dialog)({
    '& div.MuiDialog-paper': {
        // https://dev.to/webdeasy/top-20-css-buttons-animations-f41
        // #25 Pure CSS Button with Ring Indicator
        '& > button.close': {
            position: 'fixed',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            padding: 0,
        },

        '& > div[draggable]': {
            touchAction: 'none !important', // hack for iPhone
            padding: '.5rem .5rem 4rem .5rem',

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
            position: 'fixed',
            padding: '0 0.5rem 1rem 0.5rem',
            margin: 0,
            background: 'rgba(255, 255, 255, 0.8)',
            width: 'calc(100% - 1rem)',
            bottom: 0,
        }
    },
});

export default BoxItemDialog;
