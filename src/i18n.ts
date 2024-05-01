import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from './i18n/en.json';
import ja from './i18n/ja.json';
import ko from './i18n/ko.json';

const resources = {en,ja,ko};

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
