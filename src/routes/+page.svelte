<script lang="ts">
	import { projects } from '$lib/data/projects';
	import ProjectBanner from '$lib/components/ProjectBanner.svelte';
	import { onMount } from 'svelte';
	import type { Attachment } from 'svelte/attachments';

	let mainDivElement: HTMLDivElement;

	const assignMain: Attachment<HTMLDivElement> = (node) => {
		mainDivElement = node;
	};

	let projectRefs: { [key: string]: ProjectBanner } = {};
	let isScrollingToBanner = false;

	function preventEvent(event: Event) {
		event.preventDefault();
	}

	function handleClickOnBanner(id: string) {
		if (isScrollingToBanner) return;

		isScrollingToBanner = true;

		mainDivElement.addEventListener('wheel', preventEvent, { once: true });

		console.log('open project:', id);

		//TODO: PREVENT FOR SAFARI !!!
		document.addEventListener(
			'scrollend',
			() => {
				mainDivElement.removeEventListener('wheel', preventEvent);
				isScrollingToBanner = false;
			},
			{ once: true }
		);
	}

	onMount(() => {
		projectRefs[0]?.scrollIntoView();
	});
</script>

<div
	{@attach assignMain}
	class="no-scrollbar flex h-full min-h-0 snap-y snap-mandatory flex-col gap-8 overflow-y-scroll py-50 will-change-scroll"
	onscroll={() => {
		document.documentElement.style.setProperty('--bg-y', `${-mainDivElement.scrollTop * 2.5}px`);
	}}
>
	{#each projects as p (p.id)}
		<ProjectBanner bind:this={projectRefs[p.id]} project={p} onClickBanner={handleClickOnBanner} />
	{/each}
</div>
