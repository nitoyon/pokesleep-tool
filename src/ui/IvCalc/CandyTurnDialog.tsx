import React from 'react';
import { styled } from '@mui/system';
import CollapseEx from '../common/CollapseEx';
import NumericSliderInput from '../common/NumericSliderInput';
import PokemonIv from '../../util/PokemonIv';
import { formatWithComma } from '../../util/NumberUtil';
import calcCandyUsage, { calcMaxCandy, CandyCount } from '../../util/Candy';
import { getCandyName } from '../../data/pokemons';
import CandyIcon from '../Resources/CandyIcon';
import { Alert, Button, Dialog, DialogActions, InputAdornment } from '@mui/material';
import { useTranslation } from 'react-i18next';

/** Configuration for candy dialog */
type TurnConfig = CandyCount & {
    /** Required candy count */
    required: number;
    /** Count of Pokémon's candy */
    pokemon: number;
};

const CandyTurnDialog = React.memo(({ count, iv, open, onClose }: {
    count: number,
    iv: PokemonIv,
    open: boolean,
    onClose: () => void,
}
) => {
    const { t } = useTranslation();
    const [config, setConfig] = React.useState<TurnConfig>({
        required: count, pokemon: 0,
        handyS: 0, handyM: 0, handyL: 0,
        typeS: 0, typeM: 0, typeL: 0,
    });

    const onChange = React.useCallback((name: string, val: number) => {
        const newConfig = {...config};
        switch (name) {
            case 'required': newConfig.required = val; break;
            case 'pokemon': newConfig.pokemon = val; break;
            case 'handyS': newConfig.handyS = val; break;
            case 'handyM': newConfig.handyM = val; break;
            case 'handyL': newConfig.handyL = val; break;
            case 'typeS': newConfig.typeS = val; break;
            case 'typeM': newConfig.typeM = val; break;
            case 'typeL': newConfig.typeL = val; break;
        }
        setConfig(newConfig);
    }, [config]);

    React.useEffect(() => {
        if (!open) {
            return;
        }
        setConfig((prev) => ({
            ...prev, required: count,
        }));
    }, [count, open]);

    if (!open) {
        return null;
    }

    const id = iv.pokemon.id;
    const name = t(`pokemons.${getCandyName(id)}`).replace(/ \(.+/, "");

    let usage: CandyCount[] = [];
    let max: number = 0;
    const add = Math.max(0, config.required - config.pokemon);
    if (add > 0) {
        max = calcMaxCandy(config);
        if (add <= max) {
            usage = calcCandyUsage(add, config);
        }
    }

    return (<StyledDialog open={open} onClose={onClose}>
        <StyledContent>
            <header>
                <label>{t('required candy')}:</label>
                <section>
                    <NumericSliderInput min={0} max={4000} value={config.required}
                        startAdornment={<InputAdornment position="start"><CandyIcon sx={{color: '#79d073'}}/></InputAdornment>}
                        onChange={(v) => onChange('required', v)}/>
                </section>
                <label>{t('pokemon candy', {name})}:</label>
                <section>
                    <NumericSliderInput min={0} max={4000} value={config.pokemon}
                        startAdornment={<InputAdornment position="start"><CandyIcon/></InputAdornment>}
                        onChange={(v) => onChange('pokemon', v)}/>
                </section>
            </header>
            <article className="handy">
                <label>{t('handy candy')}:</label>
                <NumericSliderInput min={0} max={999} value={config.handyS}
                    startAdornment={<InputAdornment position="start">S</InputAdornment>}
                    onChange={(v) => onChange('handyS', v)}/>
                <NumericSliderInput min={0} max={99} value={config.handyM}
                    startAdornment={<InputAdornment position="start">M</InputAdornment>}
                    onChange={(v) => onChange('handyM', v)}/>
                <NumericSliderInput min={0} max={99} value={config.handyL}
                    startAdornment={<InputAdornment position="start">L</InputAdornment>}
                    onChange={(v) => onChange('handyL', v)}/>
                <span></span>
                <span>×3</span>
                <span>×20</span>
                <span>×100</span>
            </article>
            <article className="type">
                <label>{t('type candy')}:</label>
                <NumericSliderInput min={0} max={999} value={config.typeS}
                    startAdornment={<InputAdornment position="start">S</InputAdornment>}
                    onChange={(v) => onChange('typeS', v)}/>
                <NumericSliderInput min={0} max={99} value={config.typeM}
                    startAdornment={<InputAdornment position="start">M</InputAdornment>}
                    onChange={(v) => onChange('typeM', v)}/>
                <NumericSliderInput min={0} max={99} value={config.typeL}
                    startAdornment={<InputAdornment position="start">L</InputAdornment>}
                    onChange={(v) => onChange('typeL', v)}/>
                <span></span>
                <span>×4</span>
                <span>×25</span>
                <span>×125</span>
            </article>
            <CollapseEx show={add === 0}>
                <Alert severity="info">
                    {t('sufficient candy')}
                </Alert>
            </CollapseEx>
            <CollapseEx show={add > 0 && usage.length === 0}>
                <Alert severity="error">
                    {t('insufficient n candy', {n: formatWithComma(add - max)})}
                </Alert>
            </CollapseEx>
            <CollapseEx show={add > 0 && usage.length > 0}>
                <table>
                    <thead>
                        <tr>
                            <th colSpan={3} className="handy">{t('handy candy')}</th>
                            <th colSpan={3} className="type">{t('type candy')}</th>
                            <th rowSpan={2} className="sum">{t('total')}</th>
                        </tr>
                        <tr>
                            <th className="handy">S</th>
                            <th className="handy">M</th>
                            <th className="handy">L</th>
                            <th className="type">S</th>
                            <th className="type">M</th>
                            <th className="type">L</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usage.map((x, i) => {
                            const total = calcMaxCandy(x);
                            return (<tr key={i}>
                                <td className={`handy${x.handyS === 0 ? ' empty' : ''}`}>{x.handyS}</td>
                                <td className={`handy${x.handyM === 0 ? ' empty' : ''}`}>{x.handyM}</td>
                                <td className={`handy${x.handyL === 0 ? ' empty' : ''}`}>{x.handyL}</td>
                                <td className={`type${x.typeS === 0 ? ' empty' : ''}`}>{x.typeS}</td>
                                <td className={`type${x.typeM === 0 ? ' empty' : ''}`}>{x.typeM}</td>
                                <td className={`type${x.typeL === 0 ? ' empty' : ''}`}>{x.typeL}</td>
                                <td className="sum">{formatWithComma(total)}<small> (+{total - add})</small></td>
                            </tr>);
                        })}
                    </tbody>
                </table>
            </CollapseEx>
        </StyledContent>
        <DialogActions>
            <Button onClick={onClose}>{t("close")}</Button>
        </DialogActions>
    </StyledDialog>);
});

const StyledDialog = styled(Dialog)({
    '& > div.MuiDialog-container > div.MuiPaper-root': {
        // extend dialog width
        width: '100%',
        maxWidth: '400px',
        margin: '20px',
    },
});

const StyledContent = styled('div')({
    padding: '0.8rem 0.5rem 0 0.5rem',
    '& > header': {
        display: 'grid',
        gap: '0.2rem 0.8rem',
        gridTemplateColumns: '8rem 1fr',
        alignItems: 'center',
        '& > label': {
            fontSize: '0.9rem',
        },
        '& > section': {
            width: '5rem',
            '& > div.numeric': {
                '& > div.MuiInput-root': {
                    '& > input': {
                        padding: '2px 0',
                    },
                },
                '& svg': {
                    fontSize: '0.9rem',
                },
            },
        },
    },
    '& > article': {
        display: 'grid',
        gap: '0 0.8rem',
        gridTemplateColumns: '6.5rem 3.5rem 3.5rem 3.5rem',
        alignItems: 'center',
        marginTop: '0.4rem',
        '&.handy': {
            marginTop: '2rem',
        },
        '& > label': {
            fontSize: '0.9rem',
        },
        '& .numeric': {
            fontSize: '0.9rem',
            width: '3rem',
            '& .MuiInputAdornment-root > p': {
                color: '#ff6633',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textAlign: 'center',
                transform: 'scale(1, 0.9)',
            },
            '& input': {
                fontSize: '0.9rem',
            }
        },
        '&.type': {
            marginBottom: '1.5rem',
            '& .numeric .MuiInputAdornment-root > p': {
                color: '#3ba6f9',
            },
        },
        '& > span': {
            fontSize: '0.7rem',
            transform: 'scale(1, 0.9)',
            textAlign: 'right',
            opacity: 0.8,
            paddingRight: '0.5rem',
            color: '#ff6633',
            fontWeight: 'bold',
        },
        '&.type > span': {
            color: '#3ba6f9',
        },
    },
    '& .MuiAlert-root': {
        padding: '0 0.2rem',
        '& > .MuiAlert-icon': {
            marginRight: '0.4rem',
        },
    },
    '& table': {
        borderCollapse: 'separate',
        borderSpacing: '2px',
        '& th, & td': {
            fontSize: '0.8rem',
            width: '2rem',
            padding: '0 4px',
            '&.empty': {
                color: '#aaa',
            },
        },
        '& th': {
            color: '#ffffff',
            padding: '2px 4px',
            fontWeight: 'normal',
        },
        '& td': {
            background: '#eee',
            textAlign: 'right',
            '& > small': {
                color: '#666',
            },
        },
        '& th.handy': {
            background: '#ff6633',
        },
        '& td.handy': {
            background: '#ffe9e9',
        },
        '& th.type': {
            background: '#3ba6f9',
        },
        '& td.type': {
            background: '#e3efff',
        },
        '& th.sum': {
            background: '#ffaa37',
        },
        '& td.sum': {
            width: '5rem',
            background: '#ffeedd',
        },

        '& thead tr:first-child th:first-child': {
            borderTopLeftRadius: '6px',
        },
        '& thead tr:first-child th:last-child': {
            borderTopRightRadius: '6px',
        },
        '& tbody tr:last-child td:first-child': {
            borderBottomLeftRadius: '6px',
        },
        '& tbody tr:last-child td:last-child': {
            borderBottomRightRadius: '6px',
        },
    },
});


export default CandyTurnDialog;
