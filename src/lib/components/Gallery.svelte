<script lang="ts">
	import { getGlobForProjectAtIndex } from '$lib/util/viteGlobBuilder';

	interface GalleryProps {
		rows: number;
		cols: number;
		projectId: string;
		galleryIndex: number;
	}
	let { rows, cols, projectId, galleryIndex }: GalleryProps = $props();

	let imageModulesPromise = $derived(getGlobForProjectAtIndex(projectId, galleryIndex));
</script>

<div
	class="px-[2lvw] py-4"
	style={`display:grid;grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},auto);`}
>
	{#await imageModulesPromise}
		<div class="col-span-full py-8 text-center">Loading images...</div>
	{:then imageModules}
		{#each Object.entries(imageModules) as [_path, imageUrl] (imageUrl)}
			<enhanced:img src={imageUrl} alt={`image ${_path}`} class="place-self-center p-3" />
		{/each}
	{:catch error}
		<div class="col-span-full py-8 text-center text-red-500">
			Failed to load images: {error.message}
		</div>
	{/await}
</div>
