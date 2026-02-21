import type { ScaleLinear } from 'd3-scale';
import type { SolarPoint, SunTimes } from '$lib/types/sun';
import { getPhaseColor } from './colors';
import { minuteToTimeString } from './format';

export interface ChartDimensions {
	width: number;
	height: number;
	xScale: ScaleLinear<number, number>;
	yScale: ScaleLinear<number, number>;
}

export function setupCanvas(
	canvas: HTMLCanvasElement,
	width: number,
	height: number
): CanvasRenderingContext2D | null {
	const dpr = window.devicePixelRatio || 1;
	canvas.width = width * dpr;
	canvas.height = height * dpr;
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;

	const ctx = canvas.getContext('2d');
	if (!ctx) return null;

	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, width, height);
	return ctx;
}

export function drawPhaseBands(
	ctx: CanvasRenderingContext2D,
	curve: SolarPoint[],
	dim: ChartDimensions
) {
	if (curve.length === 0) return;

	for (let i = 0; i < curve.length - 1; i++) {
		const x1 = dim.xScale(curve[i].minute);
		const x2 = dim.xScale(curve[i + 1].minute);
		const color = getPhaseColor(curve[i].elevation);

		ctx.fillStyle = color;
		ctx.globalAlpha = 0.3;
		ctx.fillRect(x1, 0, x2 - x1 + 0.5, dim.height);
	}
	ctx.globalAlpha = 1;
}

export function drawHorizonLine(ctx: CanvasRenderingContext2D, dim: ChartDimensions) {
	const y = dim.yScale(0);
	ctx.strokeStyle = '#64748b';
	ctx.lineWidth = 1;
	ctx.setLineDash([4, 4]);
	ctx.beginPath();
	ctx.moveTo(dim.xScale(0), y);
	ctx.lineTo(dim.xScale(1440), y);
	ctx.stroke();
	ctx.setLineDash([]);
}

export function drawElevationCurve(
	ctx: CanvasRenderingContext2D,
	curve: SolarPoint[],
	dim: ChartDimensions
) {
	if (curve.length < 2) return;

	const horizonY = dim.yScale(0);

	// Fill gradient below curve (above horizon)
	ctx.beginPath();
	ctx.moveTo(dim.xScale(curve[0].minute), dim.yScale(curve[0].elevation));
	for (let i = 1; i < curve.length; i++) {
		ctx.lineTo(dim.xScale(curve[i].minute), dim.yScale(curve[i].elevation));
	}
	ctx.lineTo(dim.xScale(curve[curve.length - 1].minute), horizonY);
	ctx.lineTo(dim.xScale(curve[0].minute), horizonY);
	ctx.closePath();

	const gradient = ctx.createLinearGradient(0, dim.yScale(90), 0, horizonY);
	gradient.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
	gradient.addColorStop(1, 'rgba(245, 158, 11, 0.08)');
	ctx.fillStyle = gradient;
	ctx.fill();

	// Stroke the curve
	ctx.beginPath();
	ctx.moveTo(dim.xScale(curve[0].minute), dim.yScale(curve[0].elevation));
	for (let i = 1; i < curve.length; i++) {
		ctx.lineTo(dim.xScale(curve[i].minute), dim.yScale(curve[i].elevation));
	}
	ctx.strokeStyle = '#f59e0b';
	ctx.lineWidth = 2.5;
	ctx.lineJoin = 'round';
	ctx.stroke();
}

export function drawAxes(ctx: CanvasRenderingContext2D, dim: ChartDimensions) {
	ctx.fillStyle = '#94a3b8';
	ctx.font = '11px Inter, sans-serif';
	ctx.textAlign = 'center';

	// X axis - hours
	for (let h = 0; h <= 24; h += 3) {
		const x = dim.xScale(h * 60);

		ctx.fillStyle = '#475569';
		ctx.fillRect(x, dim.yScale(-30), 1, 4);

		ctx.fillStyle = '#94a3b8';
		ctx.fillText(`${h.toString().padStart(2, '0')}:00`, x, dim.height - 4);
	}

	// Y axis - elevation
	ctx.textAlign = 'right';
	for (const deg of [-20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90]) {
		const y = dim.yScale(deg);
		const x = dim.xScale(0);

		ctx.strokeStyle = '#475569';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x - 4, y);
		ctx.stroke();

		ctx.fillStyle = '#94a3b8';
		ctx.fillText(`${deg}°`, x - 8, y + 4);
	}

	// Grid lines
	ctx.strokeStyle = '#1e293b';
	ctx.lineWidth = 0.5;
	for (const deg of [0, 30, 60, 90]) {
		const y = dim.yScale(deg);
		ctx.beginPath();
		ctx.moveTo(dim.xScale(0), y);
		ctx.lineTo(dim.xScale(1440), y);
		ctx.stroke();
	}
}

export function drawTimeMarkers(
	ctx: CanvasRenderingContext2D,
	times: SunTimes,
	dim: ChartDimensions
) {
	const markers = [
		{ time: times.sunrise, label: 'Sunrise', color: '#fb923c' },
		{ time: times.solarNoon, label: 'Solar Noon', color: '#fbbf24' },
		{ time: times.sunset, label: 'Sunset', color: '#fb923c' }
	];

	for (const marker of markers) {
		if (!marker.time || isNaN(marker.time.getTime())) continue;
		const minute = marker.time.getHours() * 60 + marker.time.getMinutes();
		const x = dim.xScale(minute);

		ctx.strokeStyle = marker.color;
		ctx.lineWidth = 1;
		ctx.setLineDash([3, 3]);
		ctx.beginPath();
		ctx.moveTo(x, dim.yScale(90));
		ctx.lineTo(x, dim.yScale(-30));
		ctx.stroke();
		ctx.setLineDash([]);

		ctx.fillStyle = marker.color;
		ctx.font = '10px Inter, sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText(marker.label, x, dim.yScale(90) - 6);
	}
}

export function drawSunDisc(
	ctx: CanvasRenderingContext2D,
	curve: SolarPoint[],
	currentMinute: number,
	dim: ChartDimensions
) {
	if (curve.length === 0) return;
	const idx = Math.min(Math.floor(currentMinute), curve.length - 1);
	const point = curve[Math.max(0, idx)];
	const x = dim.xScale(point.minute);
	const y = dim.yScale(point.elevation);
	const radius = 6;

	// Glow
	const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
	glow.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
	glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
	ctx.fillStyle = glow;
	ctx.beginPath();
	ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
	ctx.fill();

	// Disc
	ctx.fillStyle = '#fbbf24';
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fill();
}

export function drawTooltip(
	ctx: CanvasRenderingContext2D,
	curve: SolarPoint[],
	mouseMinute: number,
	dim: ChartDimensions
) {
	if (curve.length === 0 || mouseMinute < 0) return;
	const idx = Math.min(Math.floor(mouseMinute), curve.length - 1);
	const point = curve[Math.max(0, idx)];
	const x = dim.xScale(point.minute);
	const y = dim.yScale(point.elevation);

	// Crosshair
	ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
	ctx.lineWidth = 1;
	ctx.setLineDash([2, 2]);
	ctx.beginPath();
	ctx.moveTo(x, 0);
	ctx.lineTo(x, dim.height);
	ctx.stroke();
	ctx.setLineDash([]);

	// Label
	const timeStr = minuteToTimeString(point.minute);
	const elevStr = `${point.elevation.toFixed(1)}°`;
	const label = `${timeStr}  ${elevStr}`;

	ctx.font = 'bold 11px Inter, sans-serif';
	const metrics = ctx.measureText(label);
	const pad = 6;
	const bw = metrics.width + pad * 2;
	const bh = 20;
	let bx = x - bw / 2;
	let by = y - bh - 10;

	if (bx < 0) bx = 0;
	if (bx + bw > dim.width) bx = dim.width - bw;
	if (by < 0) by = y + 10;

	ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
	ctx.beginPath();
	ctx.roundRect(bx, by, bw, bh, 4);
	ctx.fill();

	ctx.fillStyle = '#f1f5f9';
	ctx.textAlign = 'center';
	ctx.fillText(label, bx + bw / 2, by + bh / 2 + 4);

	// Dot
	ctx.fillStyle = '#fbbf24';
	ctx.beginPath();
	ctx.arc(x, y, 4, 0, Math.PI * 2);
	ctx.fill();
}
