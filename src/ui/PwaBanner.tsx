import React, { useCallback, useEffect, useState } from 'react';
import ResearchCalcIcon from './Resources/ResearchCalcIcon';
import IvCalcIcon from './Resources/IvCalcIcon';
import SafariIcon from './Resources/SafariIcon';
import { AppType } from './App';
import { copyToClipboard } from '../util/Clipboard';
import { Button, IconButton, Dialog, DialogContent, DialogTitle,
    Snackbar, DialogActions} from '@mui/material';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CloseIcon from '@mui/icons-material/Close';
import IosShareIcon from '@mui/icons-material/IosShare';
import { useTranslation, Trans } from 'react-i18next';

let defferedPrompt:any = undefined;

/// Show banner when pwaCount is greater than or equal to this value
const iOsShowPwaBannerThreshold = 3;

interface PwaBannerProps {
    /** Current application */
    app: AppType;
    /** The number of times this app have been opened since the first
     * launch or when the user denied adding this app to home screen.
     */
    pwaCount: number;
    /** Called when user closed this banner  */
    onClose: () => void;
}

/**
 * PWA (Progressive Web Application) banner component
 *
 * Android & Chrome (PC)
 *   Listens beforeinstallprompt event and show original UI.
 *
 * iOS
 *   Show orignal UI and tells how to add to home screen.
 */
const PwaBanner = React.memo(({app, pwaCount, onClose}:PwaBannerProps) => {
    const { t } = useTranslation();

    // iOS: show banner if user visits this page iOsShowPwaBannerThreshold times
    let initialOpen = false;
    if (/iP(hone|od|ad)/.test(navigator.userAgent)) {
        if (!window.matchMedia('(display-mode: standalone)').matches &&
            pwaCount >= iOsShowPwaBannerThreshold) {
            initialOpen = true;
        }
    }
    const [open, setOpen] = useState(initialOpen);
    const [iPhoneMessageOpen, setIPhoneMessageOpen] = useState(false);

    // If google chrome is trying to install this app, show this component
    const onBeforeInstallPrompt = useCallback((e:any) => {
        defferedPrompt = e;
        setOpen(true);
    }, []);
    useEffect(() => {
        window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
        return () => {
            window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
        };
    }, [onBeforeInstallPrompt]);

    // [Add to home screen] button click handler
    const onAddToHomeScreen = useCallback(() => {
        if (defferedPrompt !== undefined) {
            // Android or Google Chrome (PC)
            setOpen(false);
            defferedPrompt.prompt();
            defferedPrompt.userChoice.then(() => {
                defferedPrompt = undefined;
            });
        } else {
            // iPhone
            setIPhoneMessageOpen(true);
        }
    }, [setOpen]);

    // Close button click handler
    const onCloseClick = useCallback(() => {
        setOpen(false);
        onClose();
    }, [setOpen, onClose]);

    // Message for iPhone closed handler
    const onCloseMessage = useCallback(() => {
        setIPhoneMessageOpen(false);
    }, [setIPhoneMessageOpen]);

    return (
        <Snackbar open={open} className="pwa_banner">
            <div className="pwa_banner_container">
                {app === "ResearchCalc" ? <ResearchCalcIcon/> : <IvCalcIcon/>}
                <div className="pwa_banner_body">
                    <p><Trans i18nKey="pwa notice"
                        values={{app: t(`${app}.short title`)}}/>
                    </p>
                    <Button variant="contained" size="small" className="add" onClick={onAddToHomeScreen}>{t('add to home screen')}</Button>
                    <Button className="later" onClick={onCloseClick}>{t('later')}</Button>
                </div>
                <IconButton onClick={onCloseClick}><CloseIcon/></IconButton>
                <IPhoneMessageDialog open={iPhoneMessageOpen} onClose={onCloseMessage}/>
            </div>
        </Snackbar>
    );
});

interface IPhoneMessageDialogProps {
    /** Whether dialog is open or not */
    open: boolean;
    /** callback function when dialog is closed */
    onClose: () => void;
}

/// iPhone: How to add to home screen
const IPhoneMessageDialog = React.memo(({open, onClose}:IPhoneMessageDialogProps) => {
    const { t, i18n }= useTranslation();
    const [copyCompleted, setCopyCompleted] = useState(false);

    const onCopyUrl = useCallback(async () => {
        let url = "https://nitoyon.github.io/pokesleep-tool/";
        if (i18n.language !== "en") {
            url += "index." + i18n.language + ".html";
        }
        if (copyToClipboard(url)) {
            setCopyCompleted(true);
        }
    }, [setCopyCompleted, i18n.language]);
    const onCopyCompletedClose = useCallback(() => {
        setCopyCompleted(false);
    }, [setCopyCompleted]);

    return <Dialog open={open} onClose={onClose} className="ios_pwa">
        <DialogTitle>{t("how to add to home screen")}</DialogTitle>
        <IconButton onClick={onClose} className="close_button">
            <CloseIcon/>
        </IconButton>
        <DialogContent dividers>
            <ol>
                <li>
                    <Trans i18nKey="open in safari"
                        components={{safari: <SafariIcon/>}}/>
                    <div><Button onClick={onCopyUrl}>[{t('copy url')}]</Button></div>
                </li>
                <li>
                    <Trans i18nKey="push share icon"
                        components={{share: <IosShareIcon/>}}/>
                </li>
                <li>
                    <Trans i18nKey="select add to home screen"
                        components={{add: <AddBoxOutlinedIcon/>}}/>
                </li>
            </ol>
            <Snackbar open={copyCompleted} onClose={onCopyCompletedClose}
                autoHideDuration={1000} message={t('copied')}/>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </Dialog>;
});

export default PwaBanner;