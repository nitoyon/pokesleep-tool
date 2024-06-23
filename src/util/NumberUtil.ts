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