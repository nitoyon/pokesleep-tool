import './App.css';
import React from 'react';
import { InputArea, InputAreaData, fields } from './InputArea';
import PreviewScore from './PreviewScore';
import { t } from 'i18next'

type AppState = InputAreaData;

class App extends React.Component<{}, AppState> {
    constructor(props: {}) {
        super(props);
            this.state = {
            fieldIndex: 0,
            powers: fields[0].powers,
            ranks: fields[0].ranks,
            strength: 73120,
            secondSleep: true,
        };
    }

    onchange = (value: InputAreaData) => {
        this.setState(value);
    }

    render() {
        return (
            <div className="App">
                <div className="notice">{t('notice')}</div>
                <InputArea data={this.state} onchange={this.onchange}/>
                <div className="preview">
                    <PreviewScore count={4} data={this.state}/>
                    <PreviewScore count={5} data={this.state}/>
                    <PreviewScore count={6} data={this.state}/>
                    <PreviewScore count={7} data={this.state}/>
                    <PreviewScore count={8} data={this.state}/>
                </div>
            </div>
        );
    }
}

export default App;
