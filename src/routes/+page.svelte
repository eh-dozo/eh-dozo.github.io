<script lang="ts">
	import { projects } from '$lib/data/projects';
	import ProjectBanner from '$lib/components/ProjectBanner.svelte';
	import { projectDetails } from '$lib/data/projectDetails';
	import { onMount, onDestroy } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import { profileOverlay } from '$lib/stores/profileOverlay';

	let mainDivElement: HTMLDivElement;
	const toMainDivElement: Attachment<HTMLDivElement> = (node) => {
		mainDivElement = node;
	};

	let bannerExpanded = $state(false);

	let overlayExpanded = $state(false);
	let overlayAnimating = $state(false);

	let bannerElements: HTMLDivElement[] = [];

	let raf = 0;
	function onScroll() {
		if (!mainDivElement) return;
		const y = mainDivElement.scrollTop * -1.5;
		if (raf) return;
		raf = requestAnimationFrame(() => {
			document.documentElement.style.setProperty('--bg-y', `${y}px`); // bg parallax
			raf = 0;
		});
	}

	const overlayUnsub = profileOverlay.subscribe((s) => {
		overlayExpanded = s.expanded;
		overlayAnimating = s.animating;
	});

	onMount(() => {
		profileOverlay.setBannerCount(projects.length);

		profileOverlay.registerCallbacks({
			fadeBannersOut: animateBannersOut,
			fadeBannersIn: animateBannersIn
		});
	});

	onDestroy(() => {
		overlayUnsub();
	});

	function animateBannersOut(): Animation[] | null {
		if (bannerElements.length === 0) return null;

		const state = profileOverlay.get();
		const animations: Animation[] = [];

		bannerElements.forEach((el, i) => {
			if (!el) return;

			const keyframes = [
				{ opacity: '1', offset: 0 },
				{ opacity: '0', offset: 1 }
			];

			const timing: KeyframeAnimationOptions = {
				duration: state.config.fadeMs,
				delay: i * state.config.staggerMs,
				easing: 'ease-out',
				fill: 'forwards'
			};

			const animation = el.animate(keyframes, timing);
			animations.push(animation);
		});

		return animations;
	}

	function animateBannersIn(): Animation[] | null {
		if (bannerElements.length === 0) return null;

		const state = profileOverlay.get();
		const animations: Animation[] = [];

		// Fade in reverse order
		bannerElements.forEach((el, i) => {
			if (!el) return;

			const reverseIndex = bannerElements.length - 1 - i;

			const keyframes = [
				{ opacity: '0', offset: 0 },
				{ opacity: '1', offset: 1 }
			];

			const timing: KeyframeAnimationOptions = {
				duration: state.config.fadeMs,
				delay: reverseIndex * state.config.staggerMs,
				easing: 'ease-in',
				fill: 'forwards'
			};

			const animation = el.animate(keyframes, timing);
			animations.push(animation);
		});

		return animations;
	}
</script>

<div
	{@attach toMainDivElement}
	data-main-scroll
	class="no-scrollbar flex h-full min-h-0 w-full snap-y snap-mandatory flex-col gap-[2.5lvh] py-[20lvh] {bannerExpanded ||
	overlayExpanded ||
	overlayAnimating
		? 'overflow-y-hidden'
		: 'overflow-y-scroll'}"
	onscroll={onScroll}
>
	{#each projects as p, i (p.id)}
		{@const detailsForBanner = projectDetails[p.id]}
		<div bind:this={bannerElements[i]}>
			<ProjectBanner
				project={p}
				imagesProjectId={detailsForBanner?.id ?? p.id}
				isNeighbordExpanded={bannerExpanded}
				priority={i === 0}
				on:expanded={() => (bannerExpanded = true)}
				on:collapsed={() => (bannerExpanded = false)}
			/>
		</div>
	{/each}
</div>
