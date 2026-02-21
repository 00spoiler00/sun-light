<script lang="ts">
	import { sunStore, cityPresets } from '$lib/stores/sun.svelte';
	import { setupCanvas } from '$lib/utils/canvas-renderer';
	import { coastlines } from '$lib/data/world-coastlines';

	let canvas: HTMLCanvasElement;
	let container: HTMLDivElement;
	let width = $state(340);
	let height = $derived(Math.round(width / 2));
	let hoverPos: { x: number; y: number; lat: number; lng: number } | null = $state(null);

	function lngToX(lng: number, w: number) {
		return ((lng + 180) / 360) * w;
	}

	function latToY(lat: number, h: number) {
		return ((90 - lat) / 180) * h;
	}

	function xToLng(x: number, w: number) {
		return (x / w) * 360 - 180;
	}

	function yToLat(y: number, h: number) {
		return 90 - (y / h) * 180;
	}

	function handleResize() {
		if (!container) return;
		width = container.clientWidth;
	}

	function handleClick(e: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const lng = Math.round(xToLng(x, rect.width) * 10) / 10;
		const lat = Math.round(yToLat(y, rect.height) * 10) / 10;
		sunStore.setLat(Math.max(-90, Math.min(90, lat)));
		sunStore.setLng(Math.max(-180, Math.min(180, lng)));
	}

	function handleMouseMove(e: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
			hoverPos = null;
			return;
		}
		hoverPos = {
			x,
			y,
			lng: Math.round(xToLng(x, rect.width) * 10) / 10,
			lat: Math.round(yToLat(y, rect.height) * 10) / 10
		};
	}

	function handleMouseLeave() {
		hoverPos = null;
	}

	$effect(() => {
		if (!container) return;
		width = container.clientWidth;
	});

	$effect(() => {
		if (!canvas) return;

		const w = width;
		const h = height;
		const ctx = setupCanvas(canvas, w, h);
		if (!ctx) return;

		// Track reactive deps
		const currentLat = sunStore.lat.current;
		const currentLng = sunStore.lng.current;
		const _ = hoverPos;

		// Ocean background
		ctx.fillStyle = '#0c1445';
		ctx.fillRect(0, 0, w, h);

		// Grid lines
		ctx.strokeStyle = '#1a1f5e';
		ctx.lineWidth = 0.5;
		for (let lat = -60; lat <= 60; lat += 30) {
			const y = latToY(lat, h);
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(w, y);
			ctx.stroke();
		}
		for (let lng = -150; lng <= 150; lng += 30) {
			const x = lngToX(lng, w);
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, h);
			ctx.stroke();
		}

		// Land masses
		ctx.fillStyle = '#1e293b';
		ctx.strokeStyle = '#334155';
		ctx.lineWidth = 0.75;
		for (const polygon of coastlines) {
			if (polygon.length < 3) continue;
			ctx.beginPath();
			ctx.moveTo(lngToX(polygon[0][0], w), latToY(polygon[0][1], h));
			for (let i = 1; i < polygon.length; i++) {
				ctx.lineTo(lngToX(polygon[i][0], w), latToY(polygon[i][1], h));
			}
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}

		// City preset dots
		for (const city of cityPresets) {
			const cx = lngToX(city.lng, w);
			const cy = latToY(city.lat, h);
			ctx.fillStyle = '#64748b';
			ctx.beginPath();
			ctx.arc(cx, cy, 2, 0, Math.PI * 2);
			ctx.fill();
		}

		// Location marker glow
		const mx = lngToX(currentLng, w);
		const my = latToY(currentLat, h);
		const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 18);
		glow.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
		glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
		ctx.fillStyle = glow;
		ctx.beginPath();
		ctx.arc(mx, my, 18, 0, Math.PI * 2);
		ctx.fill();

		// Location marker dot
		ctx.fillStyle = '#f59e0b';
		ctx.beginPath();
		ctx.arc(mx, my, 4, 0, Math.PI * 2);
		ctx.fill();

		// Hover tooltip
		if (hoverPos) {
			const label = `${hoverPos.lat.toFixed(1)}°, ${hoverPos.lng.toFixed(1)}°`;
			ctx.font = 'bold 10px Inter, sans-serif';
			const metrics = ctx.measureText(label);
			const pad = 5;
			const bw = metrics.width + pad * 2;
			const bh = 18;
			let bx = hoverPos.x - bw / 2;
			let by = hoverPos.y - bh - 8;

			if (bx < 0) bx = 0;
			if (bx + bw > w) bx = w - bw;
			if (by < 0) by = hoverPos.y + 12;

			ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
			ctx.beginPath();
			ctx.roundRect(bx, by, bw, bh, 4);
			ctx.fill();

			ctx.fillStyle = '#f1f5f9';
			ctx.textAlign = 'center';
			ctx.fillText(label, bx + bw / 2, by + bh / 2 + 3.5);
		}
	});
</script>

<svelte:window onresize={handleResize} />

<div class="rounded-xl bg-surface-alt border border-border overflow-hidden">
	<div class="px-4 pt-3 pb-2">
		<h2 class="text-sm font-semibold text-text">World Map</h2>
	</div>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={container}
		class="w-full cursor-crosshair"
		onclick={handleClick}
		onmousemove={handleMouseMove}
		onmouseleave={handleMouseLeave}
	>
		<canvas bind:this={canvas} class="w-full block" style="height: {height}px"></canvas>
	</div>
</div>
