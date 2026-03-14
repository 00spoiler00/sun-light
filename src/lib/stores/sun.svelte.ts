import { Spring } from 'svelte/motion';
import { calculateSolarDayData } from '$lib/utils/sun-calculations';
import type { SolarDayData, CityPreset } from '$lib/types/sun';

export const cityPresets: CityPreset[] = [
	{ name: 'Barcelona', lat: 41.39, lng: 2.17 },
	{ name: 'North Pole', lat: 89.9, lng: 0 },
	{ name: 'Equator', lat: 0, lng: 0 },
	{ name: 'Sydney', lat: -33.87, lng: 151.21 },
	{ name: 'Reykjavik', lat: 64.15, lng: -21.94 },
	{ name: 'Tokyo', lat: 35.68, lng: 139.69 }
];

function getCurrentDayOfYear(): number {
	const now = new Date();
	const start = new Date(now.getFullYear(), 0, 0);
	const diff = now.getTime() - start.getTime();
	return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getCurrentMinute(): number {
	const now = new Date();
	return now.getHours() * 60 + now.getMinutes();
}

const defaultDay = getCurrentDayOfYear();
const defaultMinute = getCurrentMinute();
const defaultLat = 41.39;
const defaultLng = 2.17;

const springConfig = { stiffness: 0.15, damping: 0.7 };

class SunStore {
	lat = new Spring(defaultLat, springConfig);
	lng = new Spring(defaultLng, springConfig);
	dayOfYear = new Spring(defaultDay, springConfig);

	targetLat = $state(defaultLat);
	targetLng = $state(defaultLng);
	targetDay = $state(defaultDay);
	isDragging = $state(false);
	currentMinute = $state(defaultMinute);
	geolocating = $state(false);

	get solarData(): SolarDayData {
		const resolution = this.isDragging ? 288 : 1440;
		return calculateSolarDayData(
			this.lat.current,
			this.lng.current,
			Math.round(this.dayOfYear.current),
			resolution
		);
	}

	setLat(value: number) {
		this.targetLat = value;
		this.lat.target = value;
	}

	setLng(value: number) {
		this.targetLng = value;
		this.lng.target = value;
	}

	setDay(value: number) {
		this.targetDay = value;
		this.dayOfYear.target = value;
	}

	setDragging(value: boolean) {
		this.isDragging = value;
	}

	setCurrentMinute(value: number) {
		this.currentMinute = value;
	}

	applyPreset(preset: CityPreset) {
		this.setLat(preset.lat);
		this.setLng(preset.lng);
	}

	requestGeolocation() {
		if (typeof navigator === 'undefined' || !navigator.geolocation) return;
		this.geolocating = true;
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				this.setLat(Math.round(pos.coords.latitude * 100) / 100);
				this.setLng(Math.round(pos.coords.longitude * 100) / 100);
				this.geolocating = false;
			},
			() => {
				this.geolocating = false;
			},
			{ timeout: 10000 }
		);
	}
}

export const sunStore = new SunStore();
