<script lang="ts">
	import { sunStore } from '$lib/stores/sun.svelte';
	import { getSkyGradient } from '$lib/utils/colors';
	import { getElevationAtMinute } from '$lib/utils/sun-calculations';
	import { minuteToTimeString } from '$lib/utils/format';
	import { setupCanvas } from '$lib/utils/canvas-renderer';

	let canvas: HTMLCanvasElement;
	let container: HTMLDivElement;
	let width = $state(800);
	const height = 200;

	const stars = Array.from({ length: 80 }, () => ({
		x: Math.random(),
		y: Math.random() * 0.6,
		size: Math.random() * 1.5 + 0.5,
		twinkle: Math.random() * Math.PI * 2
	}));

	function handleResize() {
		if (!container) return;
		width = container.clientWidth;
	}

	$effect(() => {
		if (!container) return;
		width = container.clientWidth;
	});

	$effect(() => {
		if (!canvas) return;

		const ctx = setupCanvas(canvas, width, height);
		if (!ctx) return;

		const data = sunStore.solarData;
		const minute = sunStore.currentMinute;
		const elevation = getElevationAtMinute(data.curve, minute);
		const skyColors = getSkyGradient(elevation);

		const w = width;
		const h = height;

		// Sky gradient
		const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.75);
		skyGrad.addColorStop(0, skyColors.top);
		skyGrad.addColorStop(1, skyColors.bottom);
		ctx.fillStyle = skyGrad;
		ctx.fillRect(0, 0, w, h);

		// Stars (visible when elevation < -6)
		if (elevation < -6) {
			const starAlpha = Math.min(1, (-6 - elevation) / 12);
			const time = Date.now() / 1000;
			for (const star of stars) {
				const twinkle = Math.sin(time * 2 + star.twinkle) * 0.3 + 0.7;
				ctx.fillStyle = `rgba(255, 255, 255, ${starAlpha * twinkle})`;
				ctx.beginPath();
				ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		// Sun position
		const horizonY = h * 0.7;
		const sunRadius = 18;
		const maxSunY = h * 0.15;
		const sunElevNorm = Math.max(-20, Math.min(90, elevation));
		const sunY = horizonY - ((sunElevNorm + 20) / 110) * (horizonY - maxSunY);
		const sunX = w * 0.5;

		if (elevation > -10) {
			// Sun glow
			const glowRadius = sunRadius * 4;
			const glow = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.5, sunX, sunY, glowRadius);
			if (elevation < 6) {
				glow.addColorStop(0, 'rgba(255, 160, 50, 0.6)');
				glow.addColorStop(0.5, 'rgba(255, 100, 30, 0.2)');
				glow.addColorStop(1, 'rgba(255, 80, 20, 0)');
			} else {
				glow.addColorStop(0, 'rgba(255, 230, 100, 0.5)');
				glow.addColorStop(0.5, 'rgba(255, 200, 80, 0.15)');
				glow.addColorStop(1, 'rgba(255, 180, 60, 0)');
			}
			ctx.fillStyle = glow;
			ctx.beginPath();
			ctx.arc(sunX, sunY, glowRadius, 0, Math.PI * 2);
			ctx.fill();

			// Sun disc
			const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
			if (elevation < 6) {
				sunGrad.addColorStop(0, '#ffcc44');
				sunGrad.addColorStop(1, '#ff8800');
			} else {
				sunGrad.addColorStop(0, '#fff5cc');
				sunGrad.addColorStop(1, '#ffdd44');
			}
			ctx.fillStyle = sunGrad;
			ctx.beginPath();
			ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
			ctx.fill();
		}

		// Terrain silhouette
		ctx.fillStyle = '#0a0f1e';
		ctx.beginPath();
		ctx.moveTo(0, horizonY);
		for (let x = 0; x <= w; x += 1) {
			const t = x / w;
			const hill1 = Math.sin(t * Math.PI * 3) * 12;
			const hill2 = Math.sin(t * Math.PI * 7 + 1) * 5;
			const hill3 = Math.sin(t * Math.PI * 1.5 + 2) * 8;
			ctx.lineTo(x, horizonY - hill1 - hill2 - hill3);
		}
		ctx.lineTo(w, h);
		ctx.lineTo(0, h);
		ctx.closePath();
		ctx.fill();

		// Time label
		ctx.fillStyle = 'rgba(241, 245, 249, 0.8)';
		ctx.font = 'bold 14px Inter, sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText(minuteToTimeString(minute), w / 2, h - 12);
	});
</script>

<svelte:window onresize={handleResize} />

<div bind:this={container} class="w-full rounded-xl overflow-hidden bg-surface-alt border border-border">
	<canvas bind:this={canvas} class="w-full" style="height: {height}px"></canvas>
	<div class="px-4 py-2 bg-surface-alt">
		<label class="flex items-center gap-3 text-xs text-text-muted">
			<span class="shrink-0">Time of Day</span>
			<input
				type="range"
				min="0"
				max="1439"
				step="1"
				value={sunStore.currentMinute}
				oninput={(e) => sunStore.setCurrentMinute(Number(e.currentTarget.value))}
				class="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer
					[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
					[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer
					[&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(245,158,11,0.5)]"
			/>
			<span class="shrink-0 tabular-nums font-medium text-text">{minuteToTimeString(sunStore.currentMinute)}</span>
		</label>
	</div>
</div>
