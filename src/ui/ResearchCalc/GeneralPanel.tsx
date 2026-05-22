import { useState } from "react";
import BetterSecondSleepDialog, {
	type BetterSecondSleepData,
} from "./BetterSecondSleepDialog";
import PreviewScore from "./PreviewScore";
import type { InputAreaData } from "./ResearchCalcAppConfig";
import { updateActualBonus } from "./ResearchCalcAppConfig";

export default function GeneralPanel({ data }: { data: InputAreaData }) {
	const [isBetterSecondSleepDialogOpen, setBetterSecondSleepOpen] =
		useState(false);
	const onBetterSecondSleepDialogClose = () => {
		setBetterSecondSleepOpen(false);
	};

	const [betterSecondSleepData, setBetterSecondSleepData] =
		useState<BetterSecondSleepData>({
			first: { count: 0, score: 0, strength: 0 },
			second: { count: 0, score: 0, strength: 0 },
		});
	function onSecondSleepDetailClick(data: BetterSecondSleepData) {
		setBetterSecondSleepData(data);
		setBetterSecondSleepOpen(true);
	}

	const actualData = updateActualBonus(data);
	return (
		<div style={{ marginBottom: "10rem" }}>
			<PreviewScore
				count={4}
				data={actualData}
				onSecondSleepDetailClick={onSecondSleepDetailClick}
			/>
			<PreviewScore
				count={5}
				data={actualData}
				onSecondSleepDetailClick={onSecondSleepDetailClick}
			/>
			<PreviewScore
				count={6}
				data={actualData}
				onSecondSleepDetailClick={onSecondSleepDetailClick}
			/>
			<PreviewScore
				count={7}
				data={actualData}
				onSecondSleepDetailClick={onSecondSleepDetailClick}
			/>
			<PreviewScore
				count={8}
				data={actualData}
				onSecondSleepDetailClick={onSecondSleepDetailClick}
			/>
			<BetterSecondSleepDialog
				data={betterSecondSleepData}
				open={isBetterSecondSleepDialogOpen}
				onClose={onBetterSecondSleepDialogClose}
			/>
		</div>
	);
}
