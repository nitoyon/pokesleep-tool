import React from 'react';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent,
    Typography } from '@mui/material';
import { withTranslation, WithTranslation } from 'react-i18next'

interface HowToDialogProps extends WithTranslation {
    /** Whether dialog is open or not */
    open: boolean;
    /** callback function when dialog is closed */
    onClose: () => void;
}

class HowToDialog extends React.Component<HowToDialogProps> {
    render() {
        const t = this.props.t;
        return (
            <Dialog open={this.props.open} onClose={this.props.onClose}>
                <DialogTitle>{t('how to use')}</DialogTitle>
                <DialogContent dividers>
                    <Typography paragraph>{t('notice')}</Typography>
                    <Typography paragraph>{t('notice detail1')}</Typography>
                    <Typography paragraph>{t('notice detail2')}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.props.onClose}>{t('close')}</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default withTranslation()(HowToDialog);
