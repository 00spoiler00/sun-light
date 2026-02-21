<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Sun Light - Solar Position Visualizer</title>
	<meta name="description" content="Visualize sun elevation and position throughout the day for any location on Earth" />
</svelte:head>

{@render children()}
