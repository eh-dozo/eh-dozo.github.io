<script lang="ts">
	import { projects } from '$lib/data/projects';
	import ProjectBanner from '$lib/components/ProjectBanner.svelte';
	import { projectDetails } from '$lib/data/projectDetails';
	import { onMount } from 'svelte';
	import type { Attachment } from 'svelte/attachments';

	let mainDivElement: HTMLDivElement;
	const toMainDivElement: Attachment<HTMLDivElement> = (node) => {
		mainDivElement = node;
	};

	let bannerExpanded = $state(false);

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

	onMount(() => {});
</script>

<div
	{@attach toMainDivElement}
	data-main-scroll
	class="no-scrollbar flex h-full min-h-0 w-full snap-y snap-mandatory flex-col gap-[2.5lvh] py-[20lvh] {bannerExpanded
		? 'overflow-y-hidden'
		: 'overflow-y-scroll'}"
	onscroll={onScroll}
>
	{#each projects as p, i (p.id)}
		{@const detailsForBanner = projectDetails[p.id]}
		<ProjectBanner
			project={p}
			imagesProjectId={detailsForBanner?.id ?? p.id}
			priority={i === 0}
			on:expanded={() => (bannerExpanded = true)}
			on:collapsed={() => (bannerExpanded = false)}
		/>
	{/each}
</div>
