<script lang="ts">
	interface GalleryProps {
		rows: number;
		cols: number;
		images: readonly string[];
	}
	let { rows, cols, images }: GalleryProps = $props();
</script>

<div
	class="grid px-[3lvw] py-4"
	style={`grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},auto);`}
>
	{#each images as imageUrl (imageUrl)}
		<enhanced:img src={imageUrl} alt="gallery image" class="place-self-center rounded-2xl p-3" />
	{/each}
</div>
