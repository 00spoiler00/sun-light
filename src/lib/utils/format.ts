export function minuteToTimeString(minute: number): string {
	const h = Math.floor(minute / 60);
	const m = Math.floor(minute % 60);
	return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function dateToTimeString(date: Date): string {
	if (!date || isNaN(date.getTime())) return '--:--';
	const h = date.getHours();
	const m = date.getMinutes();
	return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function minutesToDuration(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = Math.round(minutes % 60);
	return `${h}h ${m}m`;
}

export function degreesToDMS(deg: number, isLat: boolean): string {
	const abs = Math.abs(deg);
	const d = Math.floor(abs);
	const mf = (abs - d) * 60;
	const m = Math.floor(mf);
	const dir = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
	return `${d}° ${m}' ${dir}`;
}

export function dayOfYearToDate(day: number, year: number = new Date().getFullYear()): Date {
	const date = new Date(year, 0);
	date.setDate(day);
	return date;
}

export function dayOfYearToString(day: number): string {
	const date = dayOfYearToDate(day);
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
