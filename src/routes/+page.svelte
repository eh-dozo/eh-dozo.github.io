<script lang="ts">
	import { projects } from '$lib/data/projects';
	import ProjectBanner from '$lib/components/ProjectBanner.svelte';
	import { onMount } from 'svelte';

	let mainDivElement: HTMLDivElement;
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

<div bind:this={mainDivElement} class="flex flex-col gap-5 px-30 py-10">
	{#each projects as p (p.id)}
		<ProjectBanner bind:this={projectRefs[p.id]} project={p} onClickBanner={handleClickOnBanner} />
	{/each}
</div>
