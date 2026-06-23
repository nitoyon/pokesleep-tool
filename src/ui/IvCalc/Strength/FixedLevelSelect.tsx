import { Divider, MenuItem } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import type { StrengthParameter } from "../../../util/PokemonStrength";
import SelectEx from "../../common/SelectEx";
import type { IvAction } from "../IvState";

const FixedLevelSelect = React.memo(
	({
		value,
		dispatch,
		sx,
	}: {
		value: StrengthParameter;
		dispatch: React.Dispatch<IvAction>;
		sx?: object;
	}) => {
		const { t } = useTranslation();

		const onLevelChange = React.useCallback(
			(val: string) => {
				dispatch({
					type: "changeParameter",
					payload: {
						parameter: {
							...value,
							level: parseInt(val, 10) as
								| 0
								| 10
								| 25
								| 30
								| 50
								| 55
								| 60
								| 70
								| 75
								| 80
								| 100,
						},
					},
				});
			},
			[dispatch, value],
		);

		return (
			<SelectEx
				sx={sx}
				menuSx={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
				}}
				value={value.level}
				onChange={onLevelChange}
			>
				<MenuItem dense value={0}>
					{t("current level")}
				</MenuItem>
				<Divider style={{ gridColumn: "1 / -1" }} />
				<MenuItem dense value={10}>
					Lv. 10
				</MenuItem>
				<MenuItem dense value={25}>
					Lv. 25
				</MenuItem>
				<MenuItem dense value={30}>
					Lv. 30
				</MenuItem>
				<MenuItem dense value={50}>
					Lv. 50
				</MenuItem>
				<MenuItem dense value={60}>
					Lv. 60
				</MenuItem>
				<MenuItem dense value={65}>
					Lv. 65
				</MenuItem>
				<MenuItem dense value={70}>
					Lv. 70
				</MenuItem>
				<MenuItem dense value={75}>
					Lv. 75
				</MenuItem>
				<MenuItem dense value={80}>
					Lv. 80
				</MenuItem>
				<MenuItem dense value={100}>
					Lv. 100
				</MenuItem>
			</SelectEx>
		);
	},
);

export default FixedLevelSelect;
