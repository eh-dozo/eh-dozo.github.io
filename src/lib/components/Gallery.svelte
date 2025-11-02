<script lang="ts">
	import type { MediaItem } from '$lib/data/projectDetails';

	interface GalleryProps {
		rows: number;
		cols: number;
		media: readonly MediaItem[];
	}
	let { rows, cols, media }: GalleryProps = $props();
</script>

<div
	class="grid px-[3lvw] pt-[1lvh] pb-[5lvh] mix-blend-difference drop-shadow-2xl"
	style={`grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},auto);`}
>
	{#each media as item (item.src)}
		{#if item.type === 'image'}
			<enhanced:img src={item.src} alt="" class="place-self-center rounded-2xl p-3" />
		{:else if item.type === 'video'}
			<video
				src={item.src}
				class="place-self-center rounded-2xl p-3 w-full max-w-full h-auto"
				autoplay
				loop
				muted
				playsinline
				disablepictureinpicture
			>
				<track kind="captions" />
			</video>
		{/if}
	{/each}
</div>
