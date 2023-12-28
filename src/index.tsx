import React from 'react';
import ReactDOM from 'react-dom/client';
import App, {loadConfig} from './App';
import i18n from './i18n';

(function() {
    // set default language using browser language
    let language = "en";
    if (window.navigator.language.match(/ja/) !== null) {
        language = "ja";
    }
    const config = loadConfig(language);
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

    window.addEventListener('load', () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js');
        }
    });
})();
