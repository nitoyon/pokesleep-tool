import React from 'react';
import { styled } from '@mui/system';
import PokemonIv from '../../util/PokemonIv';
import calcExpAndCandy, { calcExp, CalcExpAndCandyResult } from '../../util/Exp';
import { LevelInput } from './LevelControl';
import PokemonIcon from './PokemonIcon';
import { Button, Dialog, DialogActions, Input, InputAdornment, Slider } from '@mui/material';
import EastIcon from '@mui/icons-material/East';
import { useTranslation } from 'react-i18next';

const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document);

const CandyDialog = React.memo(({ iv, open, onClose }: {
    iv: PokemonIv,
    open: boolean,
    onClose: () => void }
) => {
    const { t } = useTranslation();
    const [currentLevel, setCurrentLevel] = React.useState(iv.level);
    const [expGot, setExpGot] = React.useState(0);
    const [maxExpLeft, setMaxExpLeft] = React.useState(0);
    const [targetLevel, setTargetLevel] = React.useState(65);
    const [shouldRender, setShouldRender] = React.useState(false);

    React.useEffect(() => {
        if (open) {
            setCurrentLevel(iv.level);
            setExpGot(0);
            setMaxExpLeft(calcExp(iv.level, iv.level + 1, iv));
            setShouldRender(true);
        }
        else {
            setShouldRender(false);
        }
    }, [iv, open]);

    const onCurrentLevelChange = React.useCallback((level: number) => {
        setCurrentLevel(level);
        setExpGot(0);
        setMaxExpLeft(calcExp(level, level + 1, iv));
    }, [iv]);

    const onExpSliderChange = React.useCallback((e: any) => {
        if (e === null) {
            return;
        }

        // fix iOS bug on MUI slider
        // https://github.com/mui/material-ui/issues/31869
        if (isIOS && e.type === 'mousedown') {
            return;
        }

        setExpGot(e.target.value);
    }, [maxExpLeft]);

    if (!shouldRender) {
        return null;
    }

    const result: CalcExpAndCandyResult =
        calcExpAndCandy(iv.changeLevel(currentLevel), expGot, targetLevel, "none");

    return (<>
        <StyledDialog open={open} onClose={onClose}>
            <article>
                <div className="icon">
                    <PokemonIcon idForm={iv.idForm} size={80}/>
                </div>
                <div className="levels">
                    <div className="level">
                        <div className="levelInput">
                            <label>Lv.</label>
                            <LevelInput value={currentLevel} onChange={onCurrentLevelChange}/>
                        </div>
                        <div className="expLeft">
                            <StyledSlider value={expGot}
                                min={0} max={maxExpLeft - 1} onChange={onExpSliderChange}/>
                            <Input value={maxExpLeft - expGot} type="number" size="small"
                                startAdornment={<InputAdornment position="start">あと EXP</InputAdornment>}
                                sx={{
                                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                        WebkitAppearance: 'none',
                                    },
                                    '& input[type=number]': {
                                        MozAppearance: 'textfield',
                                    },
                                }}/>
                        </div>
                    </div>
                    <EastIcon/>
                    <div className="level">
                        <div className="levelInput">
                            <label>Lv.</label>
                            <LevelInput value={targetLevel} onChange={setTargetLevel}/>
                        </div>
                    </div>
                </div>
                <div>
                    <p>exp: {result.exp}</p>
                    <p>candy: {result.candy}</p>
                    <p>dream shards: {result.shards}</p>
                </div>
            </article>
            <DialogActions>
                <Button onClick={onClose}>{t("cancel")}</Button>
            </DialogActions>
        </StyledDialog>
    </>);
});

const StyledDialog = styled(Dialog)({
    '& > div.MuiDialog-container > div.MuiPaper-root': {
        // extend dialog width
        width: '100%',
        margin: '20px',
        maxHeight: 'calc(100% - 20px)',
    },

    '& .MuiPaper-root': {
        width: '100%',

        '& > article': {
            padding: '.8rem',
            '& > div.icon': {
                margin: '0 auto 1rem',
                width: '80px',
            },
            '& > div.levels': {
                display: 'flex',
                justifyContent: 'center',
                gap: '0.7rem',
                margin: '0 auto',
                '& > div.level': {
                    width: '7rem',
                    '& > div.levelInput': {
                        color: '#79d073',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.2rem',
                        '& > label': {
                            transform: 'scale(1, 0.9)',
                            paddingTop: '0.2rem'
                        },
                        '& input': {
                            color: '#79d073',
                            fontWeight: 'bold',
                            fontSize: '1.3rem !important',
                            paddingBottom: 0,
                            transform: 'scale(1, 0.9)',
                        },
                    },
                    '& > div.expLeft': {
                        paddingTop: '0.8rem',
                        '& > div.MuiInput-root': {
                            top: '-0.2rem',
                            '& > div.MuiInputAdornment-root > p': {
                                color: '#79d073',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                transform: 'scale(1, 0.9)',
                            },
                            '& > input': {
                                padding: 0,
                                color: '#000000',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                transform: 'scale(1, 0.9)',
                            },
                        },
                    },
                },
                '& > svg': {
                    paddingTop: '0.3rem',
                    color: '#888',
                },
            },
        },
    },
})

const StyledSlider = styled(Slider)({
    color: '#79d073',
    height: 8,
    '@media (pointer: coarse)': {
        padding: 0,
    },
    padding: 0,
    '& .MuiSlider-thumb': {
        width: 14,
        height: 13,
        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: `0px 0px 0px 6px ${'rgb(121 208 155 / 30%)'}`,
        },
        '&:after': {
            width: 20,
            height: 19,
        },
    },
    '& .MuiSlider-rail': {
        backgroundColor: '#ccc',
    },
});

export default CandyDialog;
