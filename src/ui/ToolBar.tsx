import CheckIcon from "@mui/icons-material/Check";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import MoreIcon from "@mui/icons-material/MoreVert";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import {
	Avatar,
	Divider,
	Icon,
	IconButton,
	ListItemIcon,
	Menu,
	MenuItem,
} from "@mui/material";
import { styled } from "@mui/system";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type AppConfig from "./AppConfig";
import type { AppType } from "./AppConfig";
import { useAuthUser } from "./common/Hook";
import AboutDialog from "./Dialog/AboutDialog";
import FaqDialog from "./Dialog/FaqDialog";
import HowToDialog from "./Dialog/HowToDialog";
import MessageDialog from "./Dialog/MessageDialog";
import NewsListDialog from "./Dialog/NewsListDialog";
import SettingsDialog from "./Dialog/SettingsDialog";

interface ToolBarProps {
	app: AppType;
	onAppChange: (value: AppType) => void;
	onAppConfigChange: (value: AppConfig) => void;
}

export default function ToolBar({
	app,
	onAppChange,
	onAppConfigChange,
}: ToolBarProps) {
	const { t } = useTranslation();

	const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(
		null,
	);
	const isMoreMenuOpen = Boolean(moreMenuAnchor);
	const researchCalcClick = () => {
		onAppChange("ResearchCalc");
		setMoreMenuAnchor(null);
	};
	const rpCalcClick = () => {
		onAppChange("IvCalc");
		setMoreMenuAnchor(null);
	};
	const moreButtonClick = (event: React.MouseEvent<HTMLElement>) => {
		setMoreMenuAnchor(event.currentTarget);
	};
	const onMoreMenuClose = () => {
		setMoreMenuAnchor(null);
	};
	const [isHowToDialogOpen, setIsHowToDialogOpen] = useState(false);
	const howToMenuClick = () => {
		setIsHowToDialogOpen(true);
		setMoreMenuAnchor(null);
	};
	const onHowToDialogClose = () => {
		setIsHowToDialogOpen(false);
	};
	const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
	const aboutMenuClick = () => {
		setIsAboutDialogOpen(true);
		setMoreMenuAnchor(null);
	};
	const onAboutDialogClose = () => {
		setIsAboutDialogOpen(false);
	};
	const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
	const languageMenuClick = () => {
		setIsLanguageDialogOpen(true);
		setMoreMenuAnchor(null);
	};
	const onLanguageDialogClose = () => {
		setIsLanguageDialogOpen(false);
	};
	const [isNewsDialogOpen, setIsNewsDialogOpen] = useState(false);
	const newsMenuClick = () => {
		setIsNewsDialogOpen(true);
		setMoreMenuAnchor(null);
	};
	const onNewsDialogClose = () => {
		setIsNewsDialogOpen(false);
	};
	const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
	const faqMenuClick = () => {
		setIsFaqDialogOpen(true);
		setMoreMenuAnchor(null);
	};
	const onFaqDialogClose = () => {
		setIsFaqDialogOpen(false);
	};
	const { user, signIn, signOut } = useAuthUser();
	const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
	const loginMenuClick = () => {
		setMoreMenuAnchor(null);
		signIn().catch((e: unknown) => {
			console.error(e);
			setAuthErrorMessage(t("login failed"));
		});
	};
	const logoutMenuClick = () => {
		setMoreMenuAnchor(null);
		signOut().catch((e: unknown) => {
			console.error(e);
			setAuthErrorMessage(t("logout failed"));
		});
	};
	const onAuthErrorDialogClose = () => {
		setAuthErrorMessage(null);
	};

	return (
		<StyledAppBar>
			<div className="title">{t(`${app}.title`)}</div>
			<IconButton
				aria-label="actions"
				color="inherit"
				onClick={moreButtonClick}
			>
				{!user && <MoreIcon />}
				{user && (
					<Avatar
						src={user.photoURL ?? undefined}
						sx={{
							width: 24,
							height: 24,
							border: "1px solid rgba(200, 200, 200, 0.8)",
						}}
					/>
				)}
			</IconButton>
			<Menu
				anchorEl={moreMenuAnchor}
				open={isMoreMenuOpen}
				onClose={onMoreMenuClose}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
			>
				<MenuItem onClick={researchCalcClick}>
					<ListItemIcon>
						{app === "ResearchCalc" ? <CheckIcon /> : <Icon />}
					</ListItemIcon>
					{t("ResearchCalc.short title")}
				</MenuItem>
				<MenuItem onClick={rpCalcClick}>
					<ListItemIcon>
						{app === "IvCalc" ? <CheckIcon /> : <Icon />}
					</ListItemIcon>
					{t("IvCalc.short title")}
				</MenuItem>
				<Divider />
				{app === "IvCalc" && (
					<MenuItem onClick={newsMenuClick}>
						<ListItemIcon>
							<MailOutlineIcon />
						</ListItemIcon>
						{t("news")}
					</MenuItem>
				)}
				<MenuItem onClick={howToMenuClick}>
					<ListItemIcon>
						<HelpOutlineIcon />
					</ListItemIcon>
					{t("how to use")}
				</MenuItem>
				<MenuItem onClick={aboutMenuClick}>
					<ListItemIcon>
						<InfoOutlinedIcon />
					</ListItemIcon>
					{t("about")}
				</MenuItem>
				{app === "IvCalc" && (
					<MenuItem onClick={faqMenuClick}>
						<ListItemIcon>
							<QuestionAnswerOutlinedIcon />
						</ListItemIcon>
						{t("faq")}
					</MenuItem>
				)}
				<MenuItem onClick={languageMenuClick}>
					<ListItemIcon>
						<SettingsOutlinedIcon />
					</ListItemIcon>
					{t("settings")}
				</MenuItem>
				{app === "IvCalc" && !user && (
					<MenuItem onClick={loginMenuClick}>
						<ListItemIcon>
							<LoginIcon />
						</ListItemIcon>
						{t("login")}
					</MenuItem>
				)}
				{app === "IvCalc" && user && (
					<MenuItem onClick={logoutMenuClick}>
						<ListItemIcon>
							<LogoutIcon />
						</ListItemIcon>
						{t("logout")}
					</MenuItem>
				)}
			</Menu>
			<AboutDialog open={isAboutDialogOpen} onClose={onAboutDialogClose} />
			<HowToDialog
				app={app}
				open={isHowToDialogOpen}
				onClose={onHowToDialogClose}
			/>
			<SettingsDialog
				open={isLanguageDialogOpen}
				app={app}
				onAppConfigChange={onAppConfigChange}
				onClose={onLanguageDialogClose}
			/>
			<NewsListDialog open={isNewsDialogOpen} onClose={onNewsDialogClose} />
			<FaqDialog open={isFaqDialogOpen} onClose={onFaqDialogClose} />
			<MessageDialog
				open={authErrorMessage !== null}
				message={authErrorMessage}
				onClose={onAuthErrorDialogClose}
			/>
		</StyledAppBar>
	);
}

const StyledAppBar = styled("div")({
	background: "#665500",
	color: "white",
	padding: ".2rem .5rem",
	fontSize: "1rem",
	display: "flex",
	alignItems: "center",

	"@media all and (display-mode: standalone)": {
		background: "#002244",
	},
	"& > div.title": {
		flexGrow: 1,
	},
});
