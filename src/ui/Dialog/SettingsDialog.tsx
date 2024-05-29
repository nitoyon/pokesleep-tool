import React from 'react';
import { Button, Dialog, DialogActions, DialogContent,
    TextField, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { AppConfig, AppConfigContext, AppType } from '../App';
import { useTranslation } from 'react-i18next';

interface SettingsDialogProps {
    /** Whether dialog is open or not */
    open: boolean;
    /** Current app type */
    app: AppType;
    /** Call when app config is changed. */
    onAppConfigChange: (config: AppConfig) => void;
    /** callback function when dialog is closed */
    onClose: () => void;
}

export default function SettingsDialog({open, app, onAppConfigChange, onClose}: SettingsDialogProps) {
    const appConfig = React.useContext(AppConfigContext);
    const [iconUrl, setIconUrl] = React.useState(appConfig.iconUrl ?? "");
    const [alertOpen, setAlertOpen] = React.useState(false);
    const { t, i18n } = useTranslation();

    // language settings
    const lang = i18n.language;
    const onLanguageChange = (event: React.MouseEvent<HTMLElement>, value: string) => {
        i18n.changeLanguage(value);
    }
    const buttons = [];
    const resources = i18n.options.resources;
    for (const lng in resources) {
        const label = i18n.getResource(lng, "translation", "langname");
        buttons.push(<ToggleButton key={lng} value={lng} aria-label={lng}>{label}</ToggleButton>)
    }

    // icon
    let iconUrlInvalid = false;
    let iconUrlErrorMessage = "";
    if (iconUrl !== "") {
        if (!iconUrl.match(/^https?:\/\//)) {
            iconUrlInvalid = true;
            iconUrlErrorMessage = t('custom icon invalid url');
        }
        else if (!iconUrl.match(/@ID[1-4]@/)) {
            iconUrlInvalid = true;
            iconUrlErrorMessage = t('custom icon id not found');
        }
    }

    const onCustomIconChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setIconUrl(event.target.value);
    }, [setIconUrl]);
    const closeHandler = React.useCallback(() => {
        if (iconUrlInvalid) {
            setAlertOpen(true);
            return;
        }
        onAppConfigChange({...appConfig, language: lang,
            iconUrl: iconUrl !== "" ? iconUrl : null});
        onClose();
    }, [onAppConfigChange, onClose, appConfig, iconUrlInvalid, iconUrl]);
    const onAlertClose = React.useCallback(() => {
        setAlertOpen(false);
    }, [setAlertOpen]);

    return (<>
        <Dialog open={open} onClose={closeHandler} fullWidth>
            <DialogContent>
                <h3 style={{margin: '0 0 .3rem 0'}}>{t('change language')}</h3>
                <ToggleButtonGroup value={lang} orientation="vertical"
                    exclusive onChange={onLanguageChange}>
                    {buttons}
                </ToggleButtonGroup>
                {app === "IvCalc" && <>
                <h3 style={{margin: '1rem 0 0 0'}}>{t('custom icon')}</h3>
                <p style={{margin: '0.3rem 0', fontSize: '0.9rem'}}>{t('custom icon summary')}</p>
                <TextField variant="standard" fullWidth value={iconUrl}
                    placeholder={t('custom icon placeholder')}
                    error={iconUrlInvalid} helperText={iconUrlErrorMessage}
                    onChange={onCustomIconChange}/>
                <p style={{margin: '0.5rem 0 0 0', color: '#888', lineHeight: 1.1, fontSize: '0.8rem'}}>
                    {t('custom icon details')}<br/>{t('custom icon details japanese only')}
                </p>
                </>}
            </DialogContent>
            <DialogActions>
                <Button onClick={closeHandler}>{t('close')}</Button>
            </DialogActions>
        </Dialog>

        <Dialog open={alertOpen} onClose={onAlertClose}>
            <DialogContent>{t('custom icon invalid message')}</DialogContent>
            <DialogActions>
                <Button onClick={onAlertClose} autoFocus>{t('close')}</Button>
            </DialogActions>
        </Dialog>
    </>);
}
