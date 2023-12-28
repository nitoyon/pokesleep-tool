import React from 'react';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent,
    ToggleButtonGroup, ToggleButton } from '@mui/material';
import { withTranslation, WithTranslation } from 'react-i18next'

interface LanguageDialogProps extends WithTranslation {
    /** Whether dialog is open or not */
    open: boolean;
    /** callback function when dialog is closed */
    onClose: () => void;
    /** callback function when data is changed */
    onChange: (lang: string) => void;
}

type LanguageDialogState = {
    /** current language */
    lang: string;
}

class LanguageDialog extends React.Component<LanguageDialogProps, LanguageDialogState> {
    constructor(props: LanguageDialogProps) {
        super(props);
        this.state = {
            lang: props.i18n.language,
        };
    }

    onLanguageChange = (event: React.MouseEvent<HTMLElement>, value: string) => {
        this.setState({lang: value});
        this.props.onChange(value);
    }

    render() {
        const buttons = [];
        const resources = this.props.i18n.options.resources;
        for (const lng in resources) {
            const label = this.props.i18n.getResource(lng, "translation", "name");
            buttons.push(<ToggleButton key={lng} value={lng} aria-label={lng}>{label}</ToggleButton>)
        }
        const t= this.props.t;
        return (
            <Dialog open={this.props.open} onClose={this.props.onClose}>
                <DialogTitle>{t('change language')}</DialogTitle>
                <DialogContent>
                    <ToggleButtonGroup value={this.state.lang} orientation="vertical"
                        exclusive onChange={this.onLanguageChange}>
                        {buttons}
                    </ToggleButtonGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.props.onClose}>{t('close')}</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default withTranslation()(LanguageDialog);
