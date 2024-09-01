import PokemonIv from '../../util/PokemonIv';
import { copyToClipboard } from '../../util/Clipboard';
import { IvAction } from './IvState';
import i18next from 'i18next'

export function shareIv(iv: PokemonIv,
    dispatch: (action: IvAction) => void,
    t: typeof i18next.t
) {
    const id = iv.serialize();
    const baseUrl = window.location.href.split("#")[0]
        .replace(/utm_source=homescreen&?/, '')
        .replace(/\?$/, '');
    const url = `${baseUrl}#p=${id}`;

    // share url
    if (navigator.share) {
        return navigator.share({url});
    }

    return copyToClipboard(url)
        .then(() => {
            const message = t('copied');
            dispatch({type: "showAlert", payload: {message}})
        });
}