import {
	Button,
	Collapse,
	ToggleButton,
	ToggleButtonGroup,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { getActiveHelpBonus } from "../../../data/events";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import EventConfigDialog from "./EventConfigDialog";

const EventSelectControl = React.memo(
	({
		value,
		onChange,
	}: {
		onChange: (value: StrengthParameter) => void;
		value: StrengthParameter;
	}) => {
		const { t } = useTranslation();
		const [eventDetailOpen, setEventDetailOpen] = React.useState(false);

		const onEventChange = React.useCallback(
			(_: React.MouseEvent, val: string | null) => {
				if (val === null) {
					return;
				}
				if (val === "advanced") {
					val = "custom";
				}
				onChange({ ...value, event: val });
			},
			[onChange, value],
		);
		const onEventDetailClick = React.useCallback(() => {
			setEventDetailOpen(true);
		}, []);
		const onEventDetailClose = React.useCallback(() => {
			setEventDetailOpen(false);
		}, []);

		const scheduledEvents = getActiveHelpBonus(new Date())
			.map((x) => x.name)
			.reverse();
		let prevEventName = "";
		const eventToggles = ["none", ...scheduledEvents, "advanced"].map((x) => {
			let curEventName = t(`events.${x}`);
			if (
				prevEventName.replace(/\(.*/, "") === curEventName.replace(/\(.*/, "")
			) {
				curEventName = curEventName.replace(/.*\(/, "").replace(")", "");
			}
			prevEventName = curEventName;
			return (
				<ToggleButton key={x} value={x} style={{ textTransform: "none" }}>
					{curEventName}
				</ToggleButton>
			);
		});
		const eventName = ["none", ...scheduledEvents].includes(value.event)
			? value.event
			: "advanced";

		return (
			<>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "flex-end",
					}}
				>
					<ToggleButtonGroup
						size="small"
						exclusive
						value={eventName}
						onChange={onEventChange}
					>
						{eventToggles}
					</ToggleButtonGroup>
					<Collapse in={eventName === "advanced"}>
						<Button onClick={onEventDetailClick}>
							{t("configure event details")}
						</Button>
					</Collapse>
				</div>
				<EventConfigDialog
					open={eventDetailOpen}
					onClose={onEventDetailClose}
					value={value}
					onChange={onChange}
				/>
			</>
		);
	},
);

export default EventSelectControl;
