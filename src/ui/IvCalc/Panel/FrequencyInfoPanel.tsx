import React from 'react';
import { styled } from '@mui/system';
import { Collapse,
    MenuItem, Switch, ToggleButton, ToggleButtonGroup } from '@mui/material';
import PokemonIv from '../../../util/PokemonIv';
import { formatHoursLong, formatHoursShort } from '../../../util/TimeUtil';
import { frequencyToString } from '../../../util/TimeUtil';
import SelectEx from '../../common/SelectEx';
import BarChartIcon from '../../Resources/BarChartIcon';
import EnergyIcon from '../../Resources/EnergyIcon';
import { calculateInventoryDistribution } from '../../../util/PokemonInventory';
import { useElementWidth } from '../../common/Hook';
import { BarChart } from '../Chart/BarChart';
import FrequencyInfoState from './FrequencyInfoState';
import { useTranslation } from 'react-i18next';

export const FrequencyInfoPanel = React.memo(({iv, simple, state, onStateChange}: {
    iv: PokemonIv,
    simple?: boolean,
    state: FrequencyInfoState
    onStateChange: (value: FrequencyInfoState) => void
}) => {
    return <>
        <FrequencyInfoPreview iv={iv} state={state}
            onStateChange={onStateChange}/>
        <FrequencyForm iv={iv} state={state} simple={simple}
            onStateChange={onStateChange}/>
    </>;
});

// Convert CDF to PMF
function cdfToPmf(cdf: number[]): number[] {
    const pmf: number[] = [cdf[0]];
    for (let i = 1; i < cdf.length; i++) {
        pmf.push(cdf[i] - cdf[i - 1]);
    }
    return pmf;
}

// Calculate expected help count from CDF
function calculateExpectedHelps(cdf: number[]): number {
    const pmf = cdfToPmf(cdf);
    let expected = 0;
    for (let i = 0; i < pmf.length; i++) {
        expected += i * pmf[i];
    }
    return expected;
}

export const FrequencyInfoPreview = React.memo(({iv, state, onStateChange}: {
    iv: PokemonIv,
    state: FrequencyInfoState
    onStateChange: (value: FrequencyInfoState) => void
}) => {
    if (state.displayValue === "full") {
        return <FullPreview iv={iv} state={state}
            onStateChange={onStateChange}/>;
    } else {
        return <EnergyPreview iv={iv} state={state}/>;
    }
});

const EnergyPreview = React.memo(({iv, state}: {
    iv: PokemonIv,
    state: FrequencyInfoState
}) => {
    const { t } = useTranslation();

    const helpBonusCount = state.helpingBonus +
        (iv.hasHelpingBonusInActiveSubSkills ? 1 : 0);
    const baseFreq = iv.getBaseFrequency(helpBonusCount, state.campTicket,
        state.expertMode && state.expertBerry === 0,
        state.expertMode && state.expertBerry === 2);
    const convertToVal = (rate: number) => {
        switch (state.displayValue) {
            case "frequency":
                return frequencyToString(Math.floor(baseFreq * rate), t);
            case "count":
                return t('help count per hour', {n: (3600 / baseFreq / rate).toFixed(2)});
        }
        return "";
    };
    const val0 = convertToVal(1);
    const val40 = convertToVal(0.66);
    const val60 = convertToVal(0.58);
    const val80 = convertToVal(0.52);
    const val100 = convertToVal(0.45);

    return <StyledEnergyPreview>
        <span className="energy"><EnergyIcon energy={100}/>81{t('range separator')}150</span>
        <span>{val100}</span>
        <span className="energy"><EnergyIcon energy={80}/>61{t('range separator')}80</span>
        <span>{val80}</span>
        <span className="energy"><EnergyIcon energy={60}/>41{t('range separator')}60</span>
        <span>{val60}</span>
        <span className="energy"><EnergyIcon energy={40}/>1{t('range separator')}40</span>
        <span>{val40}</span>
        <span className="energy"><EnergyIcon  energy={20}/>0</span>
        <span>{val0}</span>
    </StyledEnergyPreview>;
});

const StyledEnergyPreview = styled('article')({
    margin: '0 1rem 1rem',
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr',
    gridGap: '1rem',
    rowGap: '0.5rem',
    fontSize: '0.9rem',
    alignItems: 'start',
    '& > span.energy': {
        display: 'flex',
        alignItems: 'center',
    },
});

const FullPreview = React.memo(({iv, state, onStateChange}: {
    iv: PokemonIv,
    state: FrequencyInfoState,
    onStateChange: (value: FrequencyInfoState) => void,
}) => {
    const [chartWidth, chartRef] = useElementWidth();
    const { t } = useTranslation();

    // Calculate base frequency for time conversion
    const baseFreq = iv.getBaseFrequency(
        state.helpingBonus + (iv.hasHelpingBonusInActiveSubSkills ? 1 : 0),
        state.campTicket,
        state.expertMode && state.expertBerry === 0,
        state.expertMode && state.expertBerry === 2);
    const freq = baseFreq * [1, 1, 0.66, 0.58, 0.52, 0.45][state.energy];

    const convertX = React.useCallback((index: number) => {
        return index * freq / 3600;
    }, [freq]);

    // Calculate distribution data
    const chartData = React.useMemo(() => {
        const bonus = {
            berryBonus: state.berryBonus,
            ingredientBonus: state.ingBonus,
            expertIngBonus: state.expertMode &&
                state.expertBerry !== 2 && state.expertIngBonus === 1,
        };
        const cdf = calculateInventoryDistribution(iv,
            state.campTicket, bonus);
        cdf.unshift(0); // Add initial wait time for the first help

        const pmf = cdfToPmf(cdf);
        const average = calculateExpectedHelps(cdf);

        let low = cdf.length, high = 0;
        for (let i = 0; i < cdf.length; i++) {
            if (cdf[i] <= (100 - state.highlighted) / 100 / 2) {
                continue;
            }
            low = Math.min(low, i);
            if (i === cdf.length - 1 ||
                cdf[i - 1] >= 1 - (100 - state.highlighted) / 100 / 2
            ) {
                high = i - 1;
                break;
            }
        }

        return { pmf, cdf, average, low, high };
    }, [iv, state]);

    const color = React.useCallback((index: number) =>
        (index < chartData.low || chartData.high < index) ?
            '#999' :'#1976d2'
    , [chartData]);

    const onHighlightedChange = React.useCallback((value: string) => {
        const highlighted = parseInt(value);
        onStateChange({...state, highlighted});
    }, [onStateChange, state]);

    const onDistributionModeChange = React.useCallback((_: React.MouseEvent, value: string|null) => {
        if (value === "pmf" || value === "cdf") {
            onStateChange({...state, distributionMode: value});
        }
    }, [onStateChange, state]);

    const lowTime = formatHoursLong(convertX(chartData.low), t);
    const highTime = formatHoursLong(convertX(chartData.high), t);

    return <StyledFullPreview ref={chartRef}>
        <header>
            <label>{t('time to full inventory')}:</label>
            <div className="title">
                {lowTime}{t('range separator')}{highTime}
                <small>
                    <> ({t('probability')}: </>
                    <SelectEx value={state.highlighted.toString()}
                        onChange={onHighlightedChange}>
                        <MenuItem value="50">50%</MenuItem>
                        <MenuItem value="80">80%</MenuItem>
                        <MenuItem value="90">90%</MenuItem>
                        <MenuItem value="95">95%</MenuItem>
                        <MenuItem value="99">99%</MenuItem>
                    </SelectEx>
                    <>)</>
                </small>
            </div>
            <ToggleButtonGroup size="small" exclusive
                value={state.distributionMode} onChange={onDistributionModeChange}>
                <ToggleButton value="pmf"><BarChartIcon pmf/></ToggleButton>
                <ToggleButton value="cdf"><BarChartIcon/></ToggleButton>
            </ToggleButtonGroup>
        </header>
        <BarChart
            width={chartWidth}
            data={state.distributionMode === "pmf" ? chartData.pmf : chartData.cdf}
            average={chartData.average}
            color={color}
            convertX={convertX}
            formatX={(x) => { return formatHoursShort(x, t) }}
            formatXDetail={(x) => { return formatHoursLong(x, t)}}
            formatY={(value) => `${(value * 100).toFixed(0)}%`}
            formatHover={(index) => {
                if (index === 0) {
                    return <StyledHover>
                        <label className="span">{t('before first help')}</label>
                    </StyledHover>;
                }
                const p = (chartData.pmf[index] * 100).toFixed(1);
                const pBefore = (chartData.cdf[index - 1] * 100).toFixed(1);
                const pAfter = ((1 - chartData.cdf[index]) * 100).toFixed(1);
                const timeStr = formatHoursLong(convertX(index), t);
                return <StyledHover>
                    <h2>{t('after hhmm', {hhmm: timeStr})}</h2>
                    <label>{t('help count')}:</label>
                    <div>{index}</div>
                    <label className="span">{t('full inventory probability')}:</label>
                    <label className="pad">{t('before this time')}:</label>
                    <div>{pBefore}%</div>
                    <label className="pad">{t('this time')}:</label>
                    <div>{p}%</div>
                    <label className="pad">{t('after this time')}:</label>
                    <div>{pAfter}%</div>
                </StyledHover>;
            }}
        />
    </StyledFullPreview>;
});

const StyledFullPreview = styled('article')({
    '& > header': {
        position: 'relative',
        lineHeight: 1,
        margin: '0 1rem',
        '& > label': {
            fontSize: '0.7rem',
            color: '#666',
        },
        '& > div.title': {
            fontSize: '0.9rem',
            fontWeight: 400,
            paddingTop: '0.4rem',
            '& > small > button': {
                fontSize: '0.8rem',
            },
        },
        '& > div.MuiToggleButtonGroup-root': {
            position: 'absolute',
            top: 0,
            right: 0,
            '& > button': {
                padding: '2px 4px',
                '& > svg': {
                    fontSize: '16px',
                },
            },
        },
    },
    '& > svg': {
        userSelect: 'none',
    },
});

const StyledHover = styled('article')({
    width: '175px',
    display: 'grid',
    gridTemplateColumns: '1fr fit-content(200px)',
    '& > h2': {
        margin: '5px',
        fontSize: '0.9rem',
        gridColumn: '1 / -1',
    },
    '& > label': {
        paddingLeft: 5,
        fontSize: '0.8rem',
    },
    '& > div': {
        fontSize: '0.8rem',
        textAlign: 'right',
        paddingRight: 5,
    },
    '.span': {
        gridColumn: '1 / -1',
    },
    '.pad': {
        paddingLeft: 14,
        color: '#666',
        fontSize: '0.75rem',
    },
});

export const FrequencyForm = React.memo(({iv, simple, state, onStateChange}: {
    iv: PokemonIv,
    simple?: boolean,
    state: FrequencyInfoState,
    onStateChange: (value: FrequencyInfoState) => void
}) => {
    const { t } = useTranslation();

    const onHelpingBonusChange = React.useCallback((_: React.MouseEvent, value: string|null) => {
        if (value !== null) {
            onStateChange({...state, helpingBonus: parseInt(value, 10)});
        }
    }, [state, onStateChange]);
    const onCampTicketChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onStateChange({...state, campTicket: e.target.checked});
    }, [state, onStateChange]);
    const onBerryBonusChange = React.useCallback((_: React.MouseEvent, value: string|null) => {
        if (value !== null) {
            onStateChange({...state, berryBonus: parseInt(value, 10) as 0|1});
        }
    }, [state, onStateChange]);
    const onIngBonusChange = React.useCallback((_: React.MouseEvent, value: string|null) => {
        if (value !== null) {
            onStateChange({...state, ingBonus: parseInt(value, 10) as 0|1});
        }
    }, [state, onStateChange]);
    const onExpertModeChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onStateChange({...state, expertMode: e.target.checked});
    }, [state, onStateChange]);
    const onExpertBerryChange = React.useCallback((_: React.MouseEvent, value: string|null) => {
        if (value !== null) {
            onStateChange({...state, expertBerry: parseInt(value, 10)});
        }
    }, [state, onStateChange]);
    const onExpertIngBonusChange = React.useCallback((_: React.MouseEvent, value: string|null) => {
        if (value !== null) {
            onStateChange({...state, expertIngBonus: parseInt(value, 10)});
        }
    }, [state, onStateChange]);
    const onEnergyChange = React.useCallback((_: React.MouseEvent, value: string|null) => {
        if (value === null) {
            return;
        }
        const energy = parseInt(value) as 1|2|3|4|5;
        onStateChange({...state, energy});
    }, [state, onStateChange]);
    const onValueChange = React.useCallback((_: React.MouseEvent, value: string|null) => {
        if (value === null) {
            return;
        }
        onStateChange({...state, displayValue: value as "frequency"|"count"|"full"});
    }, [state, onStateChange]);

    const hasHelpingBonus = iv.hasHelpingBonusInActiveSubSkills;
    return <StyledFrequencyControls>
        <div className="line">
            <label>{t('helping bonus')}:</label>
            <ToggleButtonGroup size="small" exclusive
                value={state.helpingBonus} onChange={onHelpingBonusChange}>
                <ToggleButton value={0}>{hasHelpingBonus ? '1' : '0'}</ToggleButton>
                <ToggleButton value={1}>{hasHelpingBonus ? '2' : '1'}</ToggleButton>
                <ToggleButton value={2}>{hasHelpingBonus ? '3' : '2'}</ToggleButton>
                <ToggleButton value={3}>{hasHelpingBonus ? '4' : '3'}</ToggleButton>
                <ToggleButton value={4}>{hasHelpingBonus ? '5' : '4'}</ToggleButton>
            </ToggleButtonGroup>
        </div>
        <div className="line">
            <label>{t('good camp ticket')}:</label>
            <Switch checked={state.campTicket} onChange={onCampTicketChange}/>
        </div>
        <Collapse in={state.displayValue === "full"}>
            <div className="line">
                <label>{t('energy')}:</label>
                <ToggleButtonGroup exclusive size="small" value={state.energy.toString()}
                    onChange={onEnergyChange}>
                    <ToggleButton value="5">
                        <EnergyIcon energy={100}/>
                        <footer>81{t('range separator')}150</footer>
                    </ToggleButton>
                    <ToggleButton value="4">
                        <EnergyIcon energy={80}/>
                        <footer>61{t('range separator')}80</footer>
                    </ToggleButton>
                    <ToggleButton value="3">
                        <EnergyIcon energy={60}/>
                        <footer>41{t('range separator')}60</footer>
                    </ToggleButton>
                    <ToggleButton value="2">
                        <EnergyIcon energy={40}/>
                        <footer>1{t('range separator')}40</footer>
                    </ToggleButton>
                    <ToggleButton value="1">
                        <EnergyIcon energy={20}/>
                        <footer>0</footer>
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>
            {!simple && <>
                <div className="line">
                    <label>{t('berry bonus from event')}:</label>
                    <ToggleButtonGroup size="small" exclusive
                        value={state.berryBonus} onChange={onBerryBonusChange}>
                        <ToggleButton value={0}>{t('none')}</ToggleButton>
                        <ToggleButton value={1}>+1</ToggleButton>
                    </ToggleButtonGroup>
                </div>
                <div className="line">
                    <label>{t('ingredient bonus from event')}:</label>
                    <ToggleButtonGroup size="small" exclusive
                        value={state.ingBonus} onChange={onIngBonusChange}>
                        <ToggleButton value={0}>{t('none')}</ToggleButton>
                        <ToggleButton value={1}>+1</ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </>}
        </Collapse>
        {!simple && <>
            <div className="line">
                <label>{t('expert mode')}:</label>
                <Switch checked={state.expertMode} onChange={onExpertModeChange}/>
            </div>
            <Collapse in={state.expertMode}>
                <div className="line">
                    <label className="indent">{t('berry')}:</label>
                    <ToggleButtonGroup size="small" exclusive
                        value={state.expertBerry} onChange={onExpertBerryChange}>
                        <ToggleButton value={0}>{t('main')}</ToggleButton>
                        <ToggleButton value={1}>{t('sub')}</ToggleButton>
                        <ToggleButton value={2}>{t('others')}</ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </Collapse>
            <Collapse in={state.expertMode && state.expertBerry !== 2 && state.displayValue === "full"}>
                <div className="line">
                    <label className="indent">{t('expert effect')}:</label>
                    <ToggleButtonGroup size="small" exclusive
                        value={state.expertIngBonus} onChange={onExpertIngBonusChange}>
                        <ToggleButton value={1}>{t('expert ing effect')}</ToggleButton>
                        <ToggleButton value={0}>{t('others')}</ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </Collapse>
        </>}
        <div className="line">
            <label>{t('value')}:</label>
        </div>
        <div className="value">
            <ToggleButtonGroup exclusive size="small" value={state.displayValue}
                onChange={onValueChange}>
                <ToggleButton value="frequency">{t('frequency')}</ToggleButton>
                <ToggleButton value="count">{t('help count')}</ToggleButton>
                <ToggleButton value="full">{t('time to full inventory')}</ToggleButton>
            </ToggleButtonGroup>
        </div>
    </StyledFrequencyControls>;
});

const StyledFrequencyControls = styled('section')({
    '& div.line': {
        fontSize: '.9rem',
        padding: '0 1rem 2px',
        display: 'flex',
        flex: '0 auto',
        alignItems: 'center',
        '& > label': {
            '&.indent': {
                paddingLeft: '1rem',
            },
            marginRight: 'auto',
        },
        '& > div': {
            paddingLeft: '.5rem',
            '& > button': {
                padding: '2px 7px',
                display: 'inline',
                lineHeight: 1,
                '& > svg': {
                    width: 18,
                    height: 18,
                },
                '& > footer': {
                    display: 'block',
                    fontSize: '0.5rem',
                    color: '#777',
                },
            },
        },
    },
    '& div.value': {
        padding: '0 1rem',
    },
    '& button.MuiToggleButton-root': {
        lineHeight: 1.3,
        textTransform: 'none',
    },
});

export default FrequencyInfoPanel;
