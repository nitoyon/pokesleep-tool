/**
 * Returns the absolute time (seconds) of the next sleep/wake transition
 * after currentSec, given whether the team is currently sleeping.
 */
export function phaseBoundarySec(
	currentSec: number,
	sleeping: boolean,
	sleepTimeSec: number,
	dayLengthSec: number,
): number {
	const day = Math.floor(currentSec / dayLengthSec);
	const dayStart = day * dayLengthSec;
	const sleepAt = sleepTimeSec + dayStart;
	const wakeAt = (day + 1) * dayLengthSec;
	if (!sleeping && sleepAt > currentSec) {
		return sleepAt;
	}
	return wakeAt;
}
