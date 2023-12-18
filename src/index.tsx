import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import i18n from './i18n';

(function() {
    i18n.changeLanguage('ja');
    
    const elm = document.getElementById('root');
    if (elm === null) {
        alert('root element not found');
        return;
    }
    const root = ReactDOM.createRoot(elm);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
})();
