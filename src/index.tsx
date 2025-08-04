import React from 'react';
import ReactDOM from 'react-dom/client';
import App, {loadConfig, saveConfig} from './ui/App';
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
    if (window.location.hostname !== "nitoyon.github.io") {
        document.body.style.padding = '30px 0px 0px';
        const ins = document.createElement('ins');
        ins.style.display = 'block';
        ins.style.width = '100%';
        ins.style.height = '30px';
        ins.style.clear = 'none';
        ins.style.float = 'none';
        ins.style.top = '0px';
        ins.style.bottom = 'auto';
        ins.style.left = '0px';
        ins.style.right = '0px';
        ins.style.margin = '0px';
        ins.style.padding = '0px';
        ins.style.position = 'fixed';
        ins.style.verticalAlign = 'baseline';
        ins.style.zIndex = '2147483647';
        ins.style.background = '#cccccc';
        document.body.appendChild(ins);
    }

    window.addEventListener('load', () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/pokesleep-tool/sw.js');
        }
    });
})();
