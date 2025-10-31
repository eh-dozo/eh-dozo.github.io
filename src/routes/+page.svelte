<script lang="ts">
	import { projects } from '$lib/data/projects';
	import ProjectBanner from '$lib/components/ProjectBanner.svelte';
	import { projectDetails } from '$lib/data/projectDetails';
	import { onMount, onDestroy } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import { fade } from 'svelte/transition';
	import { profileOverlay } from '$lib/stores/profileOverlay';

	let mainDivElement: HTMLDivElement;
	const toMainDivElement: Attachment<HTMLDivElement> = (node) => {
		mainDivElement = node;
	};

	let bannerExpanded = $state(false);

	// Overlay state
	let overlayExpanded = $state(false);
	let overlayAnimating = $state(false);
	let bannersVisible = $state(true);

	// rAF-throttled scroll handler
	let raf = 0;
	function onScroll() {
		if (!mainDivElement) return;
		const y = mainDivElement.scrollTop * -1.5;
		if (raf) return;
		raf = requestAnimationFrame(() => {
			document.documentElement.style.setProperty('--bg-y', `${y}px`);
			raf = 0;
		});
	}

	const overlayUnsub = profileOverlay.subscribe((s) => {
		overlayExpanded = s.expanded;
		overlayAnimating = s.animating;
		if (s.phase === 'fadingBannersOut') bannersVisible = false;
		if (s.phase === 'fadingBannersIn') bannersVisible = true;
	});

	onMount(() => {
		profileOverlay.setBannerCount(projects.length);
	});

	onDestroy(() => {
		overlayUnsub();
	});
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
	{#if bannersVisible}
		{#each projects as p, i (p.id)}
			{@const detailsForBanner = projectDetails[p.id]}
			<div
				out:fade={{ duration: 300, delay: i * 500 }}
				in:fade={{ duration: 300, delay: (projects.length - 1 - i) * 500 }}
			>
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
	{/if}
</div>
