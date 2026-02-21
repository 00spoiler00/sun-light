<script lang="ts">
	import { sunStore } from '$lib/stores/sun.svelte';
	import { createTimeScale, createElevationScale } from '$lib/utils/scales';
	import {
		setupCanvas,
		drawPhaseBands,
		drawHorizonLine,
		drawElevationCurve,
		drawAxes,
		drawTimeMarkers,
		drawSunDisc,
		drawTooltip
	} from '$lib/utils/canvas-renderer';

	let canvas: HTMLCanvasElement;
	let container: HTMLDivElement;
	let mouseMinute = $state(-1);
	let width = $state(800);
	let height = $state(400);

	const padding = { top: 30, right: 20, bottom: 30, left: 50 };

	function handleResize() {
		if (!container) return;
		width = container.clientWidth;
		height = Math.min(400, Math.max(250, window.innerHeight * 0.4));
	}

	function handleMouseMove(e: MouseEvent) {
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const xScale = createTimeScale(width, padding);
		const minute = xScale.invert(x);
		if (minute >= 0 && minute <= 1440) {
			mouseMinute = minute;
		} else {
			mouseMinute = -1;
		}
	}

	function handleMouseLeave() {
		mouseMinute = -1;
	}

	$effect(() => {
		if (!container) return;
		width = container.clientWidth;
		height = Math.min(400, Math.max(250, window.innerHeight * 0.4));
	});

	$effect(() => {
		if (!canvas) return;

		const ctx = setupCanvas(canvas, width, height);
		if (!ctx) return;

		const xScale = createTimeScale(width, padding);
		const yScale = createElevationScale(height, padding);
		const dim = { width, height, xScale, yScale };

		const data = sunStore.solarData;
		const currentMinute = sunStore.currentMinute;
		const _mouseMinute = mouseMinute;

		drawPhaseBands(ctx, data.curve, dim);
		drawHorizonLine(ctx, dim);
		drawAxes(ctx, dim);
		drawElevationCurve(ctx, data.curve, dim);
		drawTimeMarkers(ctx, data.times, dim);
		drawSunDisc(ctx, data.curve, currentMinute, dim);
		if (_mouseMinute >= 0) {
			drawTooltip(ctx, data.curve, _mouseMinute, dim);
		}
	});
</script>

<svelte:window onresize={handleResize} />

<div
	bind:this={container}
	class="relative w-full rounded-xl overflow-hidden bg-surface-alt border border-border"
>
	<canvas
		bind:this={canvas}
		class="w-full cursor-crosshair"
		style="height: {height}px"
		onmousemove={handleMouseMove}
		onmouseleave={handleMouseLeave}
	></canvas>
	<div class="absolute top-3 left-14 text-xs text-text-muted font-medium">
		Sun Elevation (degrees) vs Time of Day
	</div>
</div>
