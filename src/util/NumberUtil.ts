import i18next from 'i18next'

export function round1(n: number) {
    n = Math.round(n * 10);
    const f = (n % 10).toString();
    const d = formatWithComma(n / 10);
    return `${d}.${f}`;
}

export function round2(n: number) {
    n = Math.round(n * 100);
    const f = (n % 100).toString().padStart(2, "0");
    const d = formatWithComma(n / 100);
    return `${d}.${f}`;
}

export function round3(n: number) {
    n = Math.round(n * 1000);
    const f = (n % 1000).toString().padStart(3, "0");
    const d = formatWithComma(n / 1000);
    return `${d}.${f}`;
}

export function formatWithComma(n: number): string {
    const parts: string[] = [];
    n = Math.floor(n);
    while (n >= 1000) {
        parts.push((n % 1000).toString().padStart(3, "0"));
        n = Math.floor(n / 1000);
    }
    parts.push(n.toString());
    parts.reverse();
    return parts.join(",");
}

export function getFormatWithCommaPos(n :number, pos: number): number {
    const text = formatWithComma(n);
    let rawPos = 0;
    let ret = 0;

    while (rawPos < pos && ret < text.length) {
        if (text[ret] === ',') {
            ret++; // Skip comma in display text
        } else {
            rawPos++;
            ret++;
        }
    }

    // Skip any commas after reaching target position
    while (ret < text.length && text[ret] === ',') {
        ret++;
    }

    return ret;
}

export function formatNice(n: number, t: typeof i18next.t): string {
    if (n < 10) {
        return round2(n);
    }
    if (n < 1000) {
        return round1(n);
    } else if (n < 100000) {
        return formatWithComma(Math.round(n));
    }

    // Shorten number: 100000 -> 100K or 10万 according to locale
    const digits = t('short num unit digits');
    if (digits === "4") {
        return (n / 10000).toFixed(1).toString() + t('short num unit');
    }
    if (digits === "3") {
        return (n / 1000).toFixed(0).toString() + t('short num unit');
    }
    throw new Error('unknown short num digits: ' + digits);
}

export function clamp(min: number, value: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
