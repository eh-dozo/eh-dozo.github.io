<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		const handleScroll = () =>
			document.documentElement.style.setProperty('--bg-y', `${-window.scrollY * 2.5}px`);
		handleScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});
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
	<Header openProfile={() => console.log('open profile (stub)')} styleClasses="" />

	<main>
		{@render children?.()}
	</main>
</div>
