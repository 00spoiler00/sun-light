import { scaleLinear } from 'd3-scale';

export function createTimeScale(width: number, padding: { left: number; right: number }) {
	return scaleLinear()
		.domain([0, 1440])
		.range([padding.left, width - padding.right]);
}

export function createElevationScale(height: number, padding: { top: number; bottom: number }) {
	return scaleLinear()
		.domain([-30, 90])
		.range([height - padding.bottom, padding.top]);
}
