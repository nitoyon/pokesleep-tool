import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./i18n/en";

export const LANGUAGE_NAMES: Record<string, string> = {
	en: "English",
	ja: "日本語 (Japanese)",
	ko: "한국어 (Korean)",
	"zh-CN": "简体中文 (Simplified Chinese)",
	"zh-TW": "繁體中文 (Traditional Chinese)",
};

const initPromise = i18n.use(initReactI18next).init({
	resources: { en },
	lng: "en",
	fallbackLng: "en",
	interpolation: {
		escapeValue: false,
	},
	partialBundledLanguages: true,
});

export async function loadLanguage(lang: string): Promise<void> {
	await initPromise;
	if (lang === "en" || i18n.hasResourceBundle(lang, "translation")) {
		return;
	}
	let data: Record<string, unknown>;
	switch (lang) {
		case "ja":
			data = (await import("./i18n/ja.js")).default as Record<string, unknown>;
			break;
		case "ko":
			data = (await import("./i18n/ko.js")).default as Record<string, unknown>;
			break;
		case "zh-CN":
			data = (await import("./i18n/zh-CN.js")).default as Record<
				string,
				unknown
			>;
			break;
		case "zh-TW":
			data = (await import("./i18n/zh-TW.js")).default as Record<
				string,
				unknown
			>;
			break;
		default:
			return;
	}
	i18n.addResourceBundle(
		lang,
		"translation",
		data.translation as Record<string, unknown>,
		true,
		true,
	);
}

export default i18n;
