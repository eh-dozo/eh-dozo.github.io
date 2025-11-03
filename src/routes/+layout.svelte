<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import Signature from '$lib/components/Signature.svelte';
	import { profileOverlay } from '$lib/stores/profileOverlay';
	import { onMount } from 'svelte';

	let { children } = $props();

	let overlayExpanded = $state(false);
	let overlayAnimating = $state(false);

	onMount(() => {
		const unsub = profileOverlay.subscribe((s) => {
			overlayExpanded = s.expanded;
			overlayAnimating = s.animating;
		});
		return () => unsub();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<enhanced:img
	src="/src/lib/assets/bg-gogo-dark.jpeg"
	alt=""
	aria-hidden="true"
	class="pointer-events-none fixed inset-0 -z-10 size-full scale-(--html-bg-size) overflow-hidden object-cover blur-[6px]"
	style="object-position: center calc(var(--bg-y)); transform: translateZ(0); transform-origin: center;"
	loading="eager"
	fetchpriority="high"
	decoding="async"
/>

<div class="relative">
	<main class="grid h-screen grid-cols-[var(--gutter)_1fr_var(--gutter)]">
		<div class="flex flex-col place-content-between overflow-y-visible">
			<!-- <span
				class="place-self-start pl-[0.5lvw] text-left text-[4.25lvw] font-light -tracking-[2.5lvh] text-wrap text-gray-600 mix-blend-difference"
				style="writing-mode: vertical-rl; text-orientation: upright;">Portfolio</span
			> -->
		</div>

		<div class="z-10 h-full min-h-0">
			{@render children?.()}
		</div>

		<div class="overflow-y-visible">
			<Header
				openProfile={() => profileOverlay.toggle()}
				expanded={overlayExpanded}
				animating={overlayAnimating}
			/>
		</div>

		<Signature />
	</main>
</div>
