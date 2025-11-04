<script lang="ts">
	import sanitize from 'sanitize-html';
	import { SquareArrowOutUpRight } from '@lucide/svelte';

	interface ParagraphBlockProps {
		title?: string;
		text: string;
		textJustify?: string;
	}
	let { title, text, textJustify = 'left' }: ParagraphBlockProps = $props();

	const paragraphPaddings = $derived(
		textJustify === 'left' ? 'ps-[4lvw] pe-[9lvw]' : 'ps-[9lvw] pe-[4lvw]'
	);

	interface LinkPart {
		type: 'text' | 'link';
		content: string;
		url?: string;
	}

	function parseCustomLinks(input: string): LinkPart[] {
		const parts: LinkPart[] = [];
		const linkRegex = /<Link\s+url="([^"]+)">([^<]+)<\/Link>/gi;
		let lastIndex = 0;
		let match;

		while ((match = linkRegex.exec(input)) !== null) {
			if (match.index > lastIndex) {
				const textBefore = input.substring(lastIndex, match.index);
				if (textBefore) {
					parts.push({ type: 'text', content: textBefore });
				}
			}

			parts.push({
				type: 'link',
				content: match[2],
				url: match[1]
			});

			lastIndex = linkRegex.lastIndex;
		}

		if (lastIndex < input.length) {
			const textAfter = input.substring(lastIndex);
			if (textAfter) {
				parts.push({ type: 'text', content: textAfter });
			}
		}

		if (parts.length === 0) {
			parts.push({ type: 'text', content: input });
		}

		return parts;
	}

	const paragraphs = $derived(text.split('\n').filter((p) => p.trim().length > 0));
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve  -->
<div class={`flex flex-col text-justify mix-blend-difference ${paragraphPaddings} py-4`}>
	{#if title}
		<h3 class="text-[5.5lvw]">{title}</h3>
	{/if}
	{#each paragraphs as paragraph, index (index)}
		{@const parts = parseCustomLinks(paragraph)}
		<p class="pb-[3lvh] text-[2lvw] leading-none text-white mix-blend-difference text-shadow-lg">
			{#each parts as part, partIndex (`${index}-${partIndex}`)}
				{#if part.type === 'link' && part.url}
					<a
						href={part.url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-baseline gap-[0.2em] underline hover:text-lime-300"
						data-sveltekit-reload
					>
						<span>{part.content}</span>
						<SquareArrowOutUpRight class="mb-[0.3em] inline-block h-[0.6em] w-[0.6em]" />
					</a>
				{:else}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html sanitize(part.content)}
				{/if}
			{/each}
		</p>
	{/each}
</div>
