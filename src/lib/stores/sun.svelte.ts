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

const springConfig = { stiffness: 0.15, damping: 0.7 };

class SunStore {
	lat = new Spring(41.39, springConfig);
	lng = new Spring(2.17, springConfig);
	dayOfYear = new Spring(172, springConfig);

	targetLat = $state(41.39);
	targetLng = $state(2.17);
	targetDay = $state(172);
	isDragging = $state(false);
	currentMinute = $state(720);

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
}

export const sunStore = new SunStore();
