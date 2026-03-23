import React from 'react';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent,
    List, ListItemButton, ListItemText, Paper,
    ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useTranslation } from 'react-i18next'
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import News, { NewsArticle } from '../../data/news';
import { NewsArticleDialog } from '../NewsInfo';

interface NewsListDialogProps {
    open: boolean;
    onClose: () => void;
}

function formatRelativeDate(article: NewsArticle, language: string): string {
    if (Intl && Intl.RelativeTimeFormat) {
        const diff = Math.max(0, new Date().getTime() - article.date.getTime());
        const formatter = new Intl.RelativeTimeFormat(language, { style: 'long' });
        if (diff > 31536000000) {
            return article.date.toLocaleDateString();
        }
        else if (diff > 2592000000) {
            return formatter.format(-Math.floor(diff / 2592000000), 'month');
        }
        else if (diff > 86400000) {
            return formatter.format(-Math.floor(diff / 86400000), 'day');
        }
        else if (diff > 3600000) {
            return formatter.format(-Math.floor(diff / 3600000), 'hour');
        }
        else {
            return formatter.format(-Math.floor(diff / 60000), 'minute');
        }
    }
    else {
        return article.date.toLocaleDateString();
    }
}

const NewsListDialog = React.memo(({open, onClose}: NewsListDialogProps) => {
    const { t, i18n } = useTranslation();
    const [selectedArticle, setSelectedArticle] = React.useState<NewsArticle | null>(null);
    const [detailOpen, setDetailOpen] = React.useState(false);
    const contentRef = React.useRef<HTMLDivElement>(null);

    const articles = News.getArticles("IvCalc");
    const years = [...new Set(articles.map(a => a.date.getFullYear()))].sort((a, b) => b - a);
    const [selectedYear, setSelectedYear] = React.useState<number>(years[0]);

    if (!open) {
        return <></>;
    }

    const filteredArticles = articles.filter(a => a.date.getFullYear() === selectedYear);

    const onItemClick = (article: NewsArticle) => {
        setSelectedArticle(article);
        setDetailOpen(true);
    };

    const onDetailClose = () => {
        setDetailOpen(false);
    };

    return <>
        <Dialog open={open} onClose={onClose}>
            <DialogTitle><MailOutlineIcon sx={{verticalAlign: "middle", mr: 0.5}}/>{t('news')}</DialogTitle>
            <DialogContent ref={contentRef}>
                <List>
                    {filteredArticles.map((article) => (
                        <ListItemButton key={article.id} component={Paper} elevation={3}
                            sx={{mb: 2}}
                            onClick={() => onItemClick(article)}>
                            <ListItemText
                                primary={<span dangerouslySetInnerHTML={{
                                    __html: t(`IvCalc.news.${article.id}.headline`),
                                }}/>}
                                secondary={formatRelativeDate(article, i18n.language)}
                            />
                        </ListItemButton>
                    ))}
                </List>
            </DialogContent>
            <div style={{margin: "8px 20px 0"}}>
                <ToggleButtonGroup value={selectedYear} exclusive fullWidth
                    onChange={(_, val) => {
                        if (val !== null) {
                            setSelectedYear(val);
                            contentRef.current?.scrollTo(0, 0);
                        }
                    }}>
                    {years.map(year => <ToggleButton key={year} value={year}>{year}</ToggleButton>)}
                </ToggleButtonGroup>
            </div>
            <DialogActions>
                <Button onClick={onClose}>{t('close')}</Button>
            </DialogActions>
        </Dialog>
        {selectedArticle && <NewsArticleDialog
            appType="IvCalc"
            article={selectedArticle}
            open={detailOpen}
            onClose={onDetailClose}
        />}
    </>;
});

export default NewsListDialog;
