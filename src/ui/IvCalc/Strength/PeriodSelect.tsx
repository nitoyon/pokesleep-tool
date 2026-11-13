import { Divider, MenuItem } from "@mui/material";
import { styled } from "@mui/system";
import type { TFunction } from "i18next";
import React from "react";
import { useTranslation } from "react-i18next";
import { whistlePeriod } from "../../../util/Energy";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import { periodHours } from "../../../util/StrengthParameter";
import PopperMenu from "../../common/PopperMenu";
import SliderAndArrow from "../../common/SliderAndArrow";
import TextLikeButton from "../../common/TextLikeButton";
import type { IvAction } from "../IvState";

const PeriodSelect = React.memo(
	({
		value,
		dispatch,
	}: {
		value: StrengthParameter;
		dispatch: React.Dispatch<IvAction>;
	}) => {
		const { t } = useTranslation();
		const [open, setOpen] = React.useState(false);
		const anchorRef = React.useRef<HTMLButtonElement>(null);
		const onClick = React.useCallback(() => {
			setOpen(true);
		}, []);
		const onClose = React.useCallback(() => {
			setOpen(false);
		}, []);

		const changePeriod = React.useCallback(
			(period: number) => {
				dispatch({
					type: "changeParameter",
					payload: {
						parameter: {
							...value,
							period,
						},
					},
				});
			},
			[dispatch, value],
		);
		const onSliderChange = React.useCallback(
			(index: number) => {
				changePeriod(periodHours[index]);
			},
			[changePeriod],
		);
		const onMenuClick = React.useCallback(
			(event: React.MouseEvent<HTMLLIElement>) => {
				const period = Number(event.currentTarget.getAttribute("value"));
				changePeriod(period);
				setOpen(false);
			},
			[changePeriod],
		);

		const index = periodHours.indexOf(value.period);
		const sliderVal = index >= 0 ? index : periodHours.indexOf(24);

		return (
			<>
				<TextLikeButton
					ref={anchorRef}
					onClick={onClick}
					className={open ? "focused" : ""}
				>
					{getPeriodText(t, value.period)}
				</TextLikeButton>
				<PopperMenu anchorEl={anchorRef.current} open={open} onClose={onClose}>
					<StyledMenuDiv>
						<header>{t("period")}</header>
						<SliderAndArrow
							min={0}
							max={periodHours.length - 1}
							sx={{ gridColumn: "1 / -1" }}
							value={sliderVal}
							onChange={onSliderChange}
						/>
						<MenuItem value={1} dense onClick={onMenuClick}>
							{t("1hour")}
						</MenuItem>
						<MenuItem value={3} dense onClick={onMenuClick}>
							{t("3hours")}
						</MenuItem>
						<MenuItem value={8} dense onClick={onMenuClick}>
							{t("8hours")}
						</MenuItem>
						<MenuItem value={16} dense onClick={onMenuClick}>
							{t("16hours")}
						</MenuItem>
						<MenuItem value={24} dense onClick={onMenuClick}>
							{t("1day")}
						</MenuItem>
						<MenuItem value={168} dense onClick={onMenuClick}>
							{t("1week")}
						</MenuItem>
						<Divider style={{ gridColumn: "1 / -1" }} />
						<MenuItem value={-10} dense onClick={onMenuClick}>
							{t("help x10")}
						</MenuItem>
						<MenuItem value={-30} dense onClick={onMenuClick}>
							{t("help x30")}
						</MenuItem>
						<MenuItem value={-100} dense onClick={onMenuClick}>
							{t("help x100")}
						</MenuItem>
						<MenuItem value={whistlePeriod} dense onClick={onMenuClick}>
							{t("whistle")}
						</MenuItem>
					</StyledMenuDiv>
				</PopperMenu>
			</>
		);
	},
);

const StyledMenuDiv = styled("div")({
	padding: "0.4rem",
	minWidth: "14rem",
	display: "grid",
	gridTemplateColumns: "1fr 1fr",
	"& > header": {
		fontSize: "0.9rem",
		paddingBottom: "0.4rem",
		color: "#666",
	},
});

/**
 * Returns the display text of the given period.
 * @param t Translation function.
 * @param period Period value.
 * @returns Display text.
 */
function getPeriodText(t: TFunction, period: number): string {
	if (period === 168) {
		return t("1week");
	}
	if (period === 24) {
		return t("1day");
	}
	if (period > 24) {
		return t("day unit", { count: period / 24 });
	}
	return t("hour2", { count: period });
}

export default PeriodSelect;
