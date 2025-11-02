<script lang="ts">
	import sanitize from 'sanitize-html';

	interface ParagraphBlockProps {
		title?: string;
		text: string;
		textJustify?: string;
	}
	let { title, text, textJustify = 'left' }: ParagraphBlockProps = $props();

	const paragraphPaddings = $derived(
		textJustify === 'left' ? 'ps-[4lvw] pe-[9lvw]' : 'ps-[9lvw] pe-[4lvw]'
	);

	const paragraphs = $derived(text.split('\n').filter((p) => p.trim().length > 0));
</script>

<div class={`flex flex-col text-justify mix-blend-difference ${paragraphPaddings} py-4`}>
	{#if title}
		<h3 class="text-[5.5lvw]">{title}</h3>
	{/if}
	{#each paragraphs as paragraph, index (index)}
		<p class="pb-[3lvh] text-[2lvw] leading-none text-white mix-blend-difference text-shadow-lg">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html sanitize(paragraph)}
		</p>
	{/each}
</div>
