import type { PhaseColors, SolarPhase } from '$lib/types/sun';

export const phaseColors: PhaseColors = {
	night: '#0c1445',
	astronomicalTwilight: '#1a1f5e',
	nauticalTwilight: '#2d3a7a',
	civilTwilight: '#4a5a9a',
	goldenHour: '#c2703a',
	day: '#4a90d9'
};

export function getPhaseForElevation(elevation: number): SolarPhase {
	if (elevation < -18) return 'night';
	if (elevation < -12) return 'astronomicalTwilight';
	if (elevation < -6) return 'nauticalTwilight';
	if (elevation < -0.833) return 'civilTwilight';
	if (elevation < 6) return 'goldenHour';
	return 'day';
}

export function getPhaseColor(elevation: number): string {
	return phaseColors[getPhaseForElevation(elevation)];
}

export function getSkyGradient(elevation: number): { top: string; bottom: string } {
	if (elevation < -18) return { top: '#050a1a', bottom: '#0c1445' };
	if (elevation < -12) return { top: '#0c1445', bottom: '#1a1f5e' };
	if (elevation < -6) return { top: '#1a1f5e', bottom: '#2d3a7a' };
	if (elevation < -0.833) return { top: '#2d3a7a', bottom: '#6b7faa' };
	if (elevation < 6) return { top: '#d4763a', bottom: '#f0c070' };
	if (elevation < 30) return { top: '#2a6fc9', bottom: '#87ceeb' };
	return { top: '#1a5ab8', bottom: '#68b5e0' };
}

export function getCurveColor(elevation: number): string {
	if (elevation <= 0) return '#f59e0b';
	if (elevation < 15) return '#fbbf24';
	return '#fcd34d';
}
