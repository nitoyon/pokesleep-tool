import React from 'react';
import { styled } from '@mui/system';
import { AppConfig, AppConfigContext, AppType } from './App';
import News, { NewsArticle } from '../data/news';
import { Button, Dialog, DialogActions, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next'

const NewsInfo = React.memo(({appType, onAppConfigChange}: {
    appType: AppType,
    onAppConfigChange: (config: AppConfig) => void;
}) => {
    const { t } = useTranslation();
    const appConfig = React.useContext(AppConfigContext);
    const onDetailClick = React.useCallback(() => {
        setDialogOpen(true);
    }, []);
    const onCloseDialog = React.useCallback(() => {
        setDialogOpen(false);
    }, []);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    
    const articles = News.getArticles(appType);
    if (articles.length === 0) {
        return <></>;
    }

    const article = articles[0];
    const closedAtricleId = appConfig.news[appType];
    if (article.id === closedAtricleId) {
        return <></>;
    }
    const onClose = () => {
        const newConfig = {
            ...appConfig,
            news: {...appConfig.news},
        };
        newConfig.news[appType] = article.id;
        onAppConfigChange(newConfig);
    };

    return <StyledNewsInfo>
        <InfoOutlinedIcon/>
        <div>
            <span>{t(`${appType}.news.${article.id}.headline`)}</span>
            <Button onClick={onDetailClick}>[{t("details")}]</Button>
        </div>
        <IconButton onClick={onClose}><CloseIcon/></IconButton>
        <NewsArticleDialog open={dialogOpen} onClose={onCloseDialog}
            appType={appType} article={article}/>
    </StyledNewsInfo>;
});

const StyledNewsInfo = styled('div')({
    margin: '0.2rem .2rem',
    background: '#e5f6fd',
    border: '1px solid #d9e9e9',
    color: '#014343',
    borderRadius: '0.5rem',
    display: 'grid',
    gridTemplateColumns: '26px 1fr 40px',
    '& > svg': {
        color: '#0288d1',
        width: '18px',
        height: '18px',
        padding: '4px',
    },
    '& > div': {
        fontSize: '0.8rem',
        padding: '0.2rem 0',
        color: '#014480',
        '& > span': {
            marginRight: '.3rem',
        },
        '& > button': {
            padding: 0,
            minWidth: 0,
            fontSize: '0.8rem',
        },
    },
    '& > button': {
        width: '40px',
        height: '40px',
    }
});

const NewsArticleDialog = React.memo(({appType, article, open, onClose}: {
    appType: string,
    article: NewsArticle,
    open: boolean,
    onClose: () => void,
}) => {
    const { t, i18n } = useTranslation();
    if (!open) {
        return <></>;
    }

    const lines = t(`${appType}.news.${article.id}.detail`).split(/\n/g);
    const title = t(`${appType}.news.${article.id}.headline`);

    let date = "";
    if (Intl && Intl.RelativeTimeFormat) {
        const diff = Math.max(0, new Date().getTime() - article.date.getTime());
        const formatter = new Intl.RelativeTimeFormat(i18n.language, { style: 'long' });
        if (diff > 31536000000) {
            date = formatter.format(-Math.floor(diff / 31536000000), 'year');
        }
        else if (diff > 2592000000) {
            date = formatter.format(-Math.floor(diff / 2592000000), 'month');
        }
        else if (diff > 86400000) {
            date = formatter.format(-Math.floor(diff / 86400000), 'day');
        }
        else if (diff > 3600000) {
            date = formatter.format(-Math.floor(diff / 3600000), 'hour');
        }
        else {
            date = formatter.format(-Math.floor(diff / 60000), 'minute');
        }
    }
    else {
        date = article.date.toLocaleDateString();
    }
    
    return <StyledNewsArticleDialog open={open} onClose={onClose}>
        <time>{date}</time>
        <header>{title}</header>
        {lines.map((x, i) => <p key={i}>{x}</p>)}
        <DialogActions disableSpacing>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledNewsArticleDialog>;
});

const StyledNewsArticleDialog = styled(Dialog)({
    '& .MuiPaper-root': {
        padding: '1rem 1rem 0 1rem',
        '& > time': {
            fontSize: '0.7rem',
            color: '#888',
        },
        '& > header': {
            fontSize: '1rem',
            fontWeight: 'bold',
            marginBottom: '0.3rem',
        },
        '& > p': {
            fontSize: '0.9rem',
            margin: '0.4rem 0 0 0',
        },
    },
});

export default NewsInfo;
