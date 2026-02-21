export interface SolarPoint {
	minute: number;
	elevation: number;
	azimuth: number;
}

export interface SunTimes {
	sunrise: Date;
	sunset: Date;
	solarNoon: Date;
	dawn: Date;
	dusk: Date;
	nauticalDawn: Date;
	nauticalDusk: Date;
	nightEnd: Date;
	night: Date;
	goldenHourEnd: Date;
	goldenHour: Date;
}

export interface SolarDayData {
	curve: SolarPoint[];
	times: SunTimes;
	maxElevation: number;
	dayDurationMinutes: number;
}

export interface CityPreset {
	name: string;
	lat: number;
	lng: number;
}

export interface PhaseColors {
	night: string;
	astronomicalTwilight: string;
	nauticalTwilight: string;
	civilTwilight: string;
	goldenHour: string;
	day: string;
}

export type SolarPhase = 'night' | 'astronomicalTwilight' | 'nauticalTwilight' | 'civilTwilight' | 'goldenHour' | 'day';
