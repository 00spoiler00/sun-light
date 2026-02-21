<script lang="ts">
	import { sunStore } from '$lib/stores/sun.svelte';
	import { dateToTimeString, minutesToDuration } from '$lib/utils/format';

	function formatOrNA(date: Date): string {
		return dateToTimeString(date);
	}
</script>

{#snippet infoRow(label: string, value: string)}
	<div class="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
		<span class="text-xs text-text-muted">{label}</span>
		<span class="text-sm font-medium text-text tabular-nums">{value}</span>
	</div>
{/snippet}

<div class="rounded-xl bg-surface-alt border border-border p-4 space-y-1">
	<h2 class="text-sm font-semibold text-text mb-2">Solar Info</h2>

	{@render infoRow('Sunrise', formatOrNA(sunStore.solarData.times.sunrise))}
	{@render infoRow('Sunset', formatOrNA(sunStore.solarData.times.sunset))}
	{@render infoRow('Day Duration', minutesToDuration(sunStore.solarData.dayDurationMinutes))}
	{@render infoRow('Solar Noon', formatOrNA(sunStore.solarData.times.solarNoon))}
	{@render infoRow('Max Elevation', `${sunStore.solarData.maxElevation.toFixed(1)}°`)}
	{@render infoRow('Golden Hour', formatOrNA(sunStore.solarData.times.goldenHour))}
	{@render infoRow('Golden Hour End', formatOrNA(sunStore.solarData.times.goldenHourEnd))}
</div>
