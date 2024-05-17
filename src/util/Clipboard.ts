
/**
 * Copy text to clipboard.
 * @param text text to be copied.
 * @returns success or not.
 */
export function copyToClipboard(text: string): boolean {
    const elm = document.createElement("input");
    elm.readOnly = true;
    elm.value = text;
    elm.style.position = "absolute";
    elm.style.opacity = "0";
    document.body.appendChild(elm);
    elm.setSelectionRange(0, 100);
    const success = document.execCommand("copy");
    elm.parentNode?.removeChild(elm);
    return success;
}