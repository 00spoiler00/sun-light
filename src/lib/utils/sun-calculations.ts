import SunCalc from 'suncalc';
import type { SolarPoint, SunTimes, SolarDayData } from '$lib/types/sun';
import { dayOfYearToDate } from './format';

function radToDeg(rad: number): number {
	return (rad * 180) / Math.PI;
}

export function calculateElevationCurve(
	lat: number,
	lng: number,
	dayOfYear: number,
	resolution: number = 1440
): SolarPoint[] {
	const date = dayOfYearToDate(dayOfYear);
	const points: SolarPoint[] = [];
	const step = 1440 / resolution;

	for (let i = 0; i < resolution; i++) {
		const minute = i * step;
		const hours = minute / 60;
		const d = new Date(date);
		d.setHours(Math.floor(hours), Math.round((hours % 1) * 60), 0, 0);

		const pos = SunCalc.getPosition(d, lat, lng);
		points.push({
			minute,
			elevation: radToDeg(pos.altitude),
			azimuth: radToDeg(pos.azimuth) + 180
		});
	}

	return points;
}

export function calculateSunTimes(lat: number, lng: number, dayOfYear: number): SunTimes {
	const date = dayOfYearToDate(dayOfYear);
	const times = SunCalc.getTimes(date, lat, lng);

	return {
		sunrise: times.sunrise,
		sunset: times.sunset,
		solarNoon: times.solarNoon,
		dawn: times.dawn,
		dusk: times.dusk,
		nauticalDawn: times.nauticalDawn,
		nauticalDusk: times.nauticalDusk,
		nightEnd: times.nightEnd,
		night: times.night,
		goldenHourEnd: times.goldenHourEnd,
		goldenHour: times.goldenHour
	};
}

export function calculateSolarDayData(
	lat: number,
	lng: number,
	dayOfYear: number,
	resolution: number = 1440
): SolarDayData {
	const curve = calculateElevationCurve(lat, lng, dayOfYear, resolution);
	const times = calculateSunTimes(lat, lng, dayOfYear);
	const maxElevation = Math.max(...curve.map((p) => p.elevation));

	let dayDurationMinutes = 0;
	const sunrise = times.sunrise;
	const sunset = times.sunset;
	if (!isNaN(sunrise.getTime()) && !isNaN(sunset.getTime())) {
		dayDurationMinutes = (sunset.getTime() - sunrise.getTime()) / 60000;
	} else if (maxElevation > 0) {
		dayDurationMinutes = 1440;
	}

	return { curve, times, maxElevation, dayDurationMinutes };
}

export function getElevationAtMinute(curve: SolarPoint[], minute: number): number {
	if (curve.length === 0) return 0;
	const idx = Math.min(Math.floor(minute), curve.length - 1);
	return curve[Math.max(0, idx)].elevation;
}
