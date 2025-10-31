<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Signature from '$lib/components/Signature.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<enhanced:img
	src="/src/lib/assets/bg.jpg"
	alt=""
	aria-hidden="true"
	class="pointer-events-none fixed inset-0 -z-10 size-full scale-(--html-bg-size) overflow-hidden object-cover blur-[5px]"
	style="object-position: center calc(var(--bg-y)); transform: translateZ(0); transform-origin: center;"
	loading="eager"
	fetchpriority="high"
	decoding="async"
/>

<div class="relative">
	<main class="grid h-screen grid-cols-[var(--gutter)_1fr_var(--gutter)]">
		<div class="flex flex-col place-content-between overflow-y-visible">
			<span
				class="place-self-start pl-[0.5lvw] text-left text-9xl text-[100px] font-light -tracking-[2.5lvh] text-wrap text-gray-600 mix-blend-difference"
				style="writing-mode: vertical-rl; text-orientation: upright;">Portfolio</span
			>
		</div>

		<div class="z-10 h-full min-h-0">
			{@render children?.()}
		</div>

		<div class="overflow-y-visible">
			<Header openProfile={() => console.log('open profile (stub)')} />
		</div>

		<Signature />
	</main>
</div>
