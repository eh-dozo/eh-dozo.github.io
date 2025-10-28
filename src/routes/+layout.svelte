<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="relative">
	<div
		aria-hidden="true"
		class="
		pointer-events-none fixed inset-0 -z-10
		bg-(image:--bg) bg-size-(--html-bg-size)"
		style="background-position: center calc(var(--bg-y));"
	></div>

	<main class="grid h-screen grid-cols-[var(--gutter)_1fr_var(--gutter)]">
		<!-- Left gutter (non-scrollable) -->
		<div class="overflow-y-visible"></div>

		<!-- Center content column (scrollable via page content) -->
		<div class="h-full min-h-0">
			{@render children?.()}
		</div>

		<!-- Right gutter with EH button (non-scrollable) -->
		<div class="overflow-y-visible">
			<Header openProfile={() => console.log('open profile (stub)')} />
		</div>
	</main>
</div>
