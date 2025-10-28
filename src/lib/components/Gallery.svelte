<script lang="ts">
	interface GalleryProps {
		rows: number;
		cols: number;
		images: string[];
	}
	let { rows, cols, images }: GalleryProps = $props();

	const totalCells = rows * cols;
	const displayed = images.slice(0, totalCells);
</script>

<div
	class="px-[2lvw] py-4"
	style={`display:grid;grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},auto);`}
>
	{#each displayed as src, i (i)}
		<img {src} alt={`image ${i + 1}`} class="place-self-center p-3" />
	{/each}
</div>
