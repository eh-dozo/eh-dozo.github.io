<script lang="ts">
	interface ParagraphBlockProps {
		title?: string;
		text: string;
		textJustify?: string;
	}
	let { title, text, textJustify = 'left' }: ParagraphBlockProps = $props();

	const textAlignClass = $derived(
		textJustify === 'center' ? 'text-center' : textJustify === 'right' ? 'text-right' : 'text-left'
	);
	const paragraphPaddings = $derived(
		textJustify === 'left' ? 'ps-[2lvw] pe-[9lvw]' : 'ps-[14lvw] pe-[2lvw]'
	);
</script>

<div class={`flex flex-col ${textAlignClass} ${paragraphPaddings} py-4`}>
	{#if title}
		<h3 class="text-[5.5lvw]">{title}</h3>
	{/if}
	<p class="text-[2lvw]">{text}</p>
</div>
