<script lang="ts">
	interface ParagraphBlockProps {
		title?: string;
		text: string;
	}
	let { title, text }: ParagraphBlockProps = $props();
</script>

{#if title}
	<h3>{title}</h3>
{/if}
<p>{text}</p>
