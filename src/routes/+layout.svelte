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

<div>
	<Header
		openProfile={() => console.log('open profile (stub)')}
		styleClasses=""
	/>

	<main>
		{@render children?.()}
	</main>
</div>
