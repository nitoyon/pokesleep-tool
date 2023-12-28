import './App.css';
import React from 'react';
import { InputArea, InputAreaData, fields } from './InputArea';
import HowToDialog from './Dialog/HowToDialog';
import LanguageDialog from './Dialog/LanguageDialog';
import PreviewScore from './PreviewScore';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreIcon from '@mui/icons-material/MoreVert';
import { withTranslation, WithTranslation } from 'react-i18next'

interface AppState extends InputAreaData {
    /** current language */
    language: string;
    /** Whether more menu is open */
    moreMenuAnchor: HTMLElement | null;
    /** Whether about dialog is open */
    isHowToDialogOpen: boolean;
    /** Whether language dialog is open */
    isLanguageDialogOpen: boolean;
}

class App extends React.Component<WithTranslation, AppState> {
    constructor(props: WithTranslation) {
        super(props);
        this.state = this.loadState();
        this.props.i18n.changeLanguage(this.state.language);
        this.updateTitle();
    }
    
    loadState(): AppState {
        const state: AppState = {
            fieldIndex: 0,
            powers: fields[0].powers,
            ranks: fields[0].ranks,
            strength: 73120,
            bonus: 1,
            secondSleep: false,
            language: this.props.i18n.language,
            moreMenuAnchor: null,
            isHowToDialogOpen: false,
            isLanguageDialogOpen: false,
        };

        const data = localStorage.getItem("ResearchCalcPokeSleep");
        if (data === null) {
            return state;
        }
        const json = JSON.parse(data);
        if (typeof(json) !== "object") {
            return state;
        }
        if (typeof(json.fieldIndex) === "number" &&
            json.fieldIndex >= 0 && json.fieldIndex < fields.length) {
            state.fieldIndex = json.fieldIndex;
            state.powers = fields[json.fieldIndex].powers;
            state.ranks = fields[json.fieldIndex].ranks;
        }
        if (typeof(json.strength) === "number" && json.strength >= 0) {
            state.strength = json.strength;
        }
        if (typeof(json.bonus) === "number" &&
            [1, 1.5, 2, 2.5, 3, 4].includes(json.bonus)) {
            state.bonus = json.bonus;
        }
        if (typeof(json.secondSleep) === "boolean") {
            state.secondSleep = json.secondSleep;
        }
        if (typeof(json.language) === "string") {
            state.language = json.language;
        }
        return state;
    }

    saveState() {
        const state = {
            fieldIndex: this.state.fieldIndex,
            strength: this.state.strength,
            bonus: this.state.bonus,
            secondSleep: this.state.secondSleep,
            language: this.state.language,
        }
        localStorage.setItem("ResearchCalcPokeSleep", JSON.stringify(state));
    }

    onChange = (value: InputAreaData) => {
        this.setState(value, () => {
            this.saveState();
        });
    }

    onLanguageChange = (value: string) => {
        this.setState({language: value}, () => {
            this.saveState();
            this.props.i18n.changeLanguage(value);
            this.updateTitle();
        });
    }

    updateTitle() {
        document.title = this.props.t("title");
    }

    render() {
        const t = this.props.t;
        const isMoreMenuOpen = Boolean(this.state.moreMenuAnchor);
        const moreButtonClick = (event: React.MouseEvent<HTMLElement>) => {
            this.setState({moreMenuAnchor: event.currentTarget});
        };
        const onMoreMenuClose = () => {
            this.setState({moreMenuAnchor: null});
        };
        const howToMenuClick = () => {
            this.setState({isHowToDialogOpen: true, moreMenuAnchor: null});
        };
        const onHowToDialogClose = () => {
            this.setState({isHowToDialogOpen: false});
        };
        const languageMenuClick = () => {
            this.setState({isLanguageDialogOpen: true, moreMenuAnchor: null});
        };
        const onLanguageDialogClose = () => {
            this.setState({isLanguageDialogOpen: false});
        };

        return (
            <div className="App">
                <div className="appbar">
                    <div className="title">{t('title')}</div>
                    <IconButton aria-label="actions" color="inherit" onClick={moreButtonClick}>
                        <MoreIcon />
                    </IconButton>
                    <Menu anchorEl={this.state.moreMenuAnchor} open={isMoreMenuOpen}
                        onClose={onMoreMenuClose} anchorOrigin={{vertical: "bottom", horizontal: "left"}}>
                        <MenuItem onClick={languageMenuClick}>{t('change language')}</MenuItem>
                        <MenuItem onClick={howToMenuClick}>{t('how to use')}</MenuItem>
                    </Menu>
                </div>
                <InputArea data={this.state} onchange={this.onChange}/>
                <div className="notice">{t('notice')}</div>
                <div className="preview">
                    <PreviewScore count={4} data={this.state}/>
                    <PreviewScore count={5} data={this.state}/>
                    <PreviewScore count={6} data={this.state}/>
                    <PreviewScore count={7} data={this.state}/>
                    <PreviewScore count={8} data={this.state}/>
                </div>
                <HowToDialog open={this.state.isHowToDialogOpen} onClose={onHowToDialogClose}/>
                <LanguageDialog open={this.state.isLanguageDialogOpen}
                    onClose={onLanguageDialogClose} onChange={this.onLanguageChange}/>
            </div>
        );
    }
}

export default withTranslation()(App);
