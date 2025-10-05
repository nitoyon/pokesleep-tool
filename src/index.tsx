import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './ui/App';
import {loadConfig, saveConfig} from './ui/AppConfig';
import i18n from './i18n';

(function() {
    // add error handler
    window.addEventListener('error', (event) => {
        const { message, filename, lineno, colno, error } = event;
        alert(`Uncaught error: ${message} (${filename}:${lineno}:${colno}) ${error.stack}`);
    });

    // set default language using browser language
    let language = "en";
    if (window.navigator.language.match(/ja/) !== null) {
        language = "ja";
    } else if (window.navigator.language.match(/ko/) !== null) {
        language = "ko";
    } else if (window.navigator.language.match(/^zh-hant/i) !== null) {
        language = "zh-TW";
    } else if (window.navigator.language.match(/^zh/i) !== null) {
        language = "zh-CN";
    }
    const config = loadConfig(language);
    config.pwacnt++;
    saveConfig(config);
    i18n.changeLanguage(config.language);

    const elm = document.getElementById('root');
    if (elm === null) {
        alert('root element not found');
        return;
    }
    const root = ReactDOM.createRoot(elm);
    root.render(
        <React.StrictMode>
            <App config={config}/>
        </React.StrictMode>
    );

    // emulate AdSense banner
    if (import.meta.env.DEV) {
        document.body.style.padding = '30px 0px 0px';
        const ins = document.createElement('ins');
        ins.style.cssText=`display:block;width:100%;height:30px;clear:none;float:none;top:0px;bottom:auto;left:0px;right:0px;margin:0px;padding:0px;position:fixed;vertical-align:baseline;z-index:2147483647;pointer-events:none;`;
        document.body.appendChild(ins);

        const border = document.createElement('ins');
        border.style.cssText=`display: block;height:5px;margin:0;padding:0;position:relative;vertical-align:baseline;z-index:1;background-color:rgb(250, 250, 250);box-shadow:rgba(0, 0, 0, 0.2) 0px 1px 5px -1px, rgba(0, 0, 0, 0.1) 0px -1px 2px -1px;`;
        ins.appendChild(border);

        const span = document.createElement('span');
        span.style.cssText = `width:58px;height:30px;display:block;background:#fff;border-radius:0 0 8px 8px;box-shadow:rgba(0, 0, 0, 0.2) 0px 1px 5px -1px, rgba(0, 0, 0, 0.1) 0px -1px 2px -1px;`;
        border.appendChild(span);
    }

    window.addEventListener('load', () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/pokesleep-tool/sw.js');
        }
    });
})();
