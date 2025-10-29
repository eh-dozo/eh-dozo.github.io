<script lang="ts">
	import { projects } from '$lib/data/projects';
	import ProjectBanner from '$lib/components/ProjectBanner.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import ParagraphBlock from '$lib/components/ParagraphBlock.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import { projectDetails } from '$lib/data/projectDetails';
	import type { ProjectDetails } from '$lib/data/projectDetails';
	import { onMount } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import { ensureProjectImagesLoaded, getGalleryImages } from '$lib/util/projectImages';

	let mainDivElement: HTMLDivElement;
	const toMainDivElement: Attachment<HTMLDivElement> = (node) => {
		mainDivElement = node;
	};

	let isScrollingToBanner = false;

	let modalOpen = $state(false);
	let selectedProjectId: string | null = $state(null);
	let pendingProjectId: string | null = null;
	let pendingAssetsProjectId: string | null = null;

	function preventEvent(event: Event) {
		event.preventDefault();
	}

	async function openModalFor(id: string) {
		console.log('Opening modal');
		selectedProjectId = id;
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
		selectedProjectId = null;
	}

	async function handleClickOnBanner(
		id: string,
		alreadyCentered: boolean,
		assetsProjectId: string
	) {
		console.log('handle click: on banner with id: ', id, '; alreadyCentered: ', alreadyCentered);
		if (isScrollingToBanner) {
			console.log('handle click: Is already scrolling to banner');
			return;
		}

		// deduped if already in-flight
		const preloadPromise = ensureProjectImagesLoaded(assetsProjectId).catch(() => {});

		if (alreadyCentered) {
			console.log('handle click: is already centered');
			await preloadPromise;
			openModalFor(id);
			return;
		}

		isScrollingToBanner = true;
		pendingProjectId = id;
		pendingAssetsProjectId = assetsProjectId;

		mainDivElement.addEventListener('wheel', preventEvent, { once: true });

		//TODO: PREVENT FOR SAFARI !!!
		mainDivElement.addEventListener(
			'scrollend',
			async () => {
				console.log('handle click: scroll end');
				mainDivElement.removeEventListener('wheel', preventEvent);
				isScrollingToBanner = false;

				if (pendingProjectId) {
					if (pendingAssetsProjectId) {
						try {
							await ensureProjectImagesLoaded(pendingAssetsProjectId);
						} catch (e) {
							void e;
						}
					}
					openModalFor(pendingProjectId);
					pendingProjectId = null;
					pendingAssetsProjectId = null;
				}
			},
			{ once: true }
		);
	}

	type Paragraph = NonNullable<ProjectDetails['paragraphs']>[number];
	type GalleryGroup = NonNullable<ProjectDetails['galleries']>[number];
	type ContentItem =
		| { kind: 'paragraph'; idx: number; data: Paragraph }
		| { kind: 'gallery'; idx: number; data: GalleryGroup };

	function composeContent(details: ProjectDetails): ContentItem[] {
		const paragraphs = details.paragraphs ?? [];
		const galleries = details.galleries ?? [];
		const out: ContentItem[] = [];
		let pi = 0;
		let gi = 0;
		const paragraphFirst = (details.arrangement ?? 'paragraph-first') === 'paragraph-first';

		if (paragraphFirst) {
			while (pi < paragraphs.length && gi < galleries.length) {
				out.push({ kind: 'paragraph', idx: pi, data: paragraphs[pi++] });
				out.push({ kind: 'gallery', idx: gi, data: galleries[gi++] });
			}
		} else {
			while (pi < paragraphs.length && gi < galleries.length) {
				out.push({ kind: 'gallery', idx: gi, data: galleries[gi++] });
				out.push({ kind: 'paragraph', idx: pi, data: paragraphs[pi++] });
			}
		}

		while (pi < paragraphs.length) {
			out.push({ kind: 'paragraph', idx: pi, data: paragraphs[pi++] });
		}
		while (gi < galleries.length) {
			out.push({ kind: 'gallery', idx: gi, data: galleries[gi++] });
		}

		return out;
	}

	onMount(() => {});
</script>

<div
	{@attach toMainDivElement}
	class="no-scrollbar flex h-full min-h-0 w-full snap-y snap-mandatory flex-col gap-[2.5lvh] overflow-y-scroll py-[12.5lvh] will-change-scroll"
	onscroll={() => {
		document.documentElement.style.setProperty('--bg-y', `${-mainDivElement.scrollTop * 2.5}px`);
	}}
>
	{#each projects as p (p.id)}
		{@const detailsForBanner = projectDetails[p.id]}
		<ProjectBanner
			project={p}
			imagesProjectId={detailsForBanner?.id ?? p.id}
			onClickBanner={handleClickOnBanner}
		/>
	{/each}
</div>

{#if modalOpen && selectedProjectId}
	<Modal open={modalOpen} onClose={closeModal}>
		{@const details = projectDetails[selectedProjectId]}
		{#if details}
			{@const content = composeContent(details)}
			{#each content as item (item.kind === 'paragraph' ? `p-${item.idx}` : `g-${item.idx}`)}
				{#if item.kind === 'paragraph'}
					<ParagraphBlock
						title={item.data.title}
						text={item.data.text}
						textJustify={item.data.textJustify}
					/>
				{:else}
					<Gallery
						rows={item.data.maxRows}
						cols={item.data.maxCols}
						images={getGalleryImages(details.id, item.idx) ?? []}
					/>
				{/if}
			{/each}
		{/if}
	</Modal>
{/if}
