<script lang="ts">
	import SunElevationChart from '$lib/components/SunElevationChart.svelte';
	import HorizonVisualization from '$lib/components/HorizonVisualization.svelte';
	import LocationControls from '$lib/components/LocationControls.svelte';
	import WorldMap from '$lib/components/WorldMap.svelte';
	import SunInfoPanel from '$lib/components/SunInfoPanel.svelte';
</script>

<div class="min-h-screen p-4 lg:p-6">
	<header class="mb-6">
		<h1 class="text-2xl font-bold text-text">Sun Light</h1>
		<p class="text-sm text-text-muted mt-1">Solar position visualizer</p>
	</header>

	<div class="grid gap-4 lg:gap-6 lg:grid-cols-[1fr_340px]">
		<!-- Main visualizations -->
		<div class="space-y-4 lg:space-y-6 min-w-0">
			<SunElevationChart />
			<HorizonVisualization />
		</div>

		<!-- Sidebar controls -->
		<div class="space-y-4 lg:space-y-6">
			<LocationControls />
			<WorldMap />
			<SunInfoPanel />
		</div>
	</div>
</div>
