import json
import os

LANGS = ["en", "ja", "ko", "zh-CN", "zh-TW"]

COMMON_KEYS = {
    "settings", "change language",
    "custom icon", "custom icon summary", "custom icon placeholder",
    "custom icon details", "custom icon details japanese only",
    "custom icon invalid url", "custom icon id not found", "custom icon invalid message",
    "ok", "close", "cancel", "clear", "reset", "save", "add", "edit",
    "duplicate", "delete", "share", "details",
    "area", "none", "enabled",
    "pwa notice", "add to home screen", "later", "how to add to home screen",
    "open in safari", "copy url", "push share icon", "select add to home screen", "copied",
    "about1", "profile", "x username", "about2", "about3", "about4",
    "num", "short num unit", "short num unit digits",
    "how to use", "about", "news",
}

RESEARCH_KEYS = {
    "ResearchCalc",
    "own research note", "rp collection", "movie detail",
    "sleep score table", "score is too low",
    "tracking title", "tracking desc1", "tracking go plus+ title", "tracking go plus+ detail",
    "tracking desc2", "tracking desc3", "start tracking", "abort tracking", "end tracking",
    "confirm abort", "tracking", "tracked", "drowsy power", "time range", "remaining time",
    "sleep state",
    "aim sleep type", "aim dozing", "aim snoozing", "aim slumbering",
    "research area", "strength", "bonus", "bonus not match",
    "sleep twice", "total n pokemon", "range separator", "text separator",
    "hhmm_short", "mmss_short", "ss_short", "hhmm", "after hhmm", "freq hhmmss",
    "hour_one", "hour_other", "hour", "minute_one", "minute_other", "minute",
    "hour2_zero", "hour2_one", "hour2_other",
    "minute2_one", "minute2_other", "second2_one", "second2_other",
    "strength too low", "strength too much",
    "next strength to get 1 more pokemon", "border is not fixed",
    "dozing", "snoozing", "slumbering", "first sleep", "second sleep",
}

EVENTS_KEYS = {"events"}
SKILLS_KEYS = {"skills"}
DATA_KEYS = {"subskill", "natures", "nature effect", "types", "generation"}
POKEMONS_KEYS = {"pokemons"}

# Everything else goes to IvCalc
KNOWN_KEYS = COMMON_KEYS | RESEARCH_KEYS | EVENTS_KEYS | SKILLS_KEYS | DATA_KEYS | POKEMONS_KEYS

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
i18n_dir = os.path.join(base, "src", "i18n")

for lang in LANGS:
    src_path = os.path.join(i18n_dir, f"{lang}.json")
    with open(src_path, encoding="utf-8") as f:
        data = json.load(f)
    translation = data["translation"]

    parts = {
        "common": {}, "ResearchCalc": {}, "IvCalc": {},
        "events": {}, "skills": {}, "data": {}, "pokemons": {}
    }

    for key, value in translation.items():
        if key in COMMON_KEYS:
            parts["common"][key] = value
        elif key in RESEARCH_KEYS:
            parts["ResearchCalc"][key] = value
        elif key in EVENTS_KEYS:
            parts["events"][key] = value
        elif key in SKILLS_KEYS:
            parts["skills"][key] = value
        elif key in DATA_KEYS:
            parts["data"][key] = value
        elif key in POKEMONS_KEYS:
            parts["pokemons"][key] = value
        else:
            # IvCalc catch-all
            parts["IvCalc"][key] = value

    out_dir = os.path.join(i18n_dir, lang)
    os.makedirs(out_dir, exist_ok=True)

    for part_name, part_data in parts.items():
        out_path = os.path.join(out_dir, f"{part_name}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(part_data, f, ensure_ascii=False, indent=4)
        print(f"  Wrote {lang}/{part_name}.json ({len(part_data)} keys)")

print("Done!")
