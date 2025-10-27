<script lang="ts">
	import { projects } from '$lib/data/projects';
	import ProjectBanner from '$lib/components/ProjectBanner.svelte';

	let mainDivElement: HTMLDivElement;

	let isScrolling = false;
	let projectRefs: { [key: string]: ProjectBanner } = {};

	function preventUserWheelScroll(event: Event) {
		event.preventDefault();
	}

	function handleClickOnBanner(id: string) {
		if (isScrolling) return;

		isScrolling = true;

		mainDivElement.addEventListener('wheel', preventUserWheelScroll, { once: true });

		console.log('open project:', id);

		projectRefs[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });

		document.addEventListener(
			'scrollend',
			() => {
				mainDivElement.removeEventListener('wheel', preventUserWheelScroll);
				isScrolling = false;
			},
			{ once: true }
		);
	}
</script>

<div bind:this={mainDivElement} class="flex flex-col gap-6 px-8">
	{#each projects as p (p.id)}
		<ProjectBanner bind:this={projectRefs[p.id]} project={p} openProject={handleClickOnBanner} />
	{/each}
</div>
