<script lang="ts">
	import { sunStore, cityPresets } from '$lib/stores/sun.svelte';
	import { degreesToDMS, dayOfYearToString } from '$lib/utils/format';

	function handleDragStart() {
		sunStore.setDragging(true);
	}

	function handleDragEnd() {
		sunStore.setDragging(false);
	}
</script>

<div class="space-y-5">
	<div class="rounded-xl bg-surface-alt border border-border p-4 space-y-4">
		<h2 class="text-sm font-semibold text-text">Location & Date</h2>

		<!-- Latitude -->
		<div class="space-y-1.5">
			<div class="flex justify-between text-xs">
				<span class="text-text-muted">Latitude</span>
				<span class="text-text font-medium tabular-nums">{sunStore.targetLat.toFixed(1)}° ({degreesToDMS(sunStore.targetLat, true)})</span>
			</div>
			<input
				type="range"
				min="-90"
				max="90"
				step="0.1"
				value={sunStore.targetLat}
				oninput={(e) => sunStore.setLat(Number(e.currentTarget.value))}
				onpointerdown={handleDragStart}
				onpointerup={handleDragEnd}
				class="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer
					[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
					[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer
					[&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(245,158,11,0.5)]"
			/>
		</div>

		<!-- Longitude -->
		<div class="space-y-1.5">
			<div class="flex justify-between text-xs">
				<span class="text-text-muted">Longitude</span>
				<span class="text-text font-medium tabular-nums">{sunStore.targetLng.toFixed(1)}° ({degreesToDMS(sunStore.targetLng, false)})</span>
			</div>
			<input
				type="range"
				min="-180"
				max="180"
				step="0.1"
				value={sunStore.targetLng}
				oninput={(e) => sunStore.setLng(Number(e.currentTarget.value))}
				onpointerdown={handleDragStart}
				onpointerup={handleDragEnd}
				class="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer
					[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
					[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer
					[&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(245,158,11,0.5)]"
			/>
		</div>

		<!-- Day of Year -->
		<div class="space-y-1.5">
			<div class="flex justify-between text-xs">
				<span class="text-text-muted">Day of Year</span>
				<span class="text-text font-medium tabular-nums">{dayOfYearToString(sunStore.targetDay)} (day {sunStore.targetDay})</span>
			</div>
			<input
				type="range"
				min="1"
				max="365"
				step="1"
				value={sunStore.targetDay}
				oninput={(e) => sunStore.setDay(Number(e.currentTarget.value))}
				onpointerdown={handleDragStart}
				onpointerup={handleDragEnd}
				class="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer
					[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
					[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:cursor-pointer
					[&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(245,158,11,0.5)]"
			/>
		</div>
	</div>

	<!-- City Presets -->
	<div class="rounded-xl bg-surface-alt border border-border p-4 space-y-3">
		<h2 class="text-sm font-semibold text-text">Presets</h2>
		<div class="flex flex-wrap gap-2">
			<button
				class="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
					bg-surface border-border text-text-muted hover:bg-surface-hover hover:text-text"
				onclick={() => sunStore.requestGeolocation()}
				disabled={sunStore.geolocating}
			>
				{sunStore.geolocating ? 'Locating...' : 'My Location'}
			</button>
			{#each cityPresets as preset}
				<button
					class="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
						{sunStore.targetLat === preset.lat && sunStore.targetLng === preset.lng
							? 'bg-accent/20 border-accent text-accent'
							: 'bg-surface border-border text-text-muted hover:bg-surface-hover hover:text-text'}"
					onclick={() => sunStore.applyPreset(preset)}
				>
					{preset.name}
				</button>
			{/each}
		</div>
	</div>
</div>
