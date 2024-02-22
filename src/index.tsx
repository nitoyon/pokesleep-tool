import React from 'react';
import ReactDOM from 'react-dom/client';
import App, {loadConfig, saveConfig} from './App';
import ToolBar from './ToolBar';
import { ThemeProvider, createTheme } from '@mui/material';
import i18n from './i18n';

const theme = createTheme({
    typography: {
        allVariants: {
            fontFamily: `"M PLUS 1p"`,
        }
    }
});

(function() {
    // set default language using browser language
    let language = "en";
    if (window.navigator.language.match(/ja/) !== null) {
        language = "ja";
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
            <ThemeProvider theme={theme}>
                <ToolBar/>
                <App config={config}/>
            </ThemeProvider>
        </React.StrictMode>
    );

    window.addEventListener('load', () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js');
        }
    });
})();
