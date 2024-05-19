
/**
 * Copy text to clipboard.
 * @param text text to be copied.
 * @returns Promise object.
 */
export function copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard) {
        return navigator.clipboard.writeText(text);
    }

    const elm = document.createElement("textarea");
    elm.readOnly = true;
    elm.value = text;
    elm.style.position = "absolute";
    elm.style.opacity = "0";
    document.body.appendChild(elm);
    elm.setSelectionRange(0, text.length);
    const success = document.execCommand("copy");
    elm.parentNode?.removeChild(elm);
    return success ? Promise.resolve() : Promise.reject();
}