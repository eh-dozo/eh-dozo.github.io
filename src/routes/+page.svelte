<script lang="ts">
	import { projects } from '$lib/data/projects';
	import ProjectBanner from '$lib/components/ProjectBanner.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import ParagraphBlock from '$lib/components/ParagraphBlock.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import { projectDetails } from '$lib/data/projectDetails';
	import { onMount } from 'svelte';
	import type { Attachment } from 'svelte/attachments';

	let mainDivElement: HTMLDivElement;
	const toMainDivElement: Attachment<HTMLDivElement> = (node) => {
		mainDivElement = node;
	};

	let isScrollingToBanner = false;

	let modalOpen = $state(false);
	let selectedProjectId: string | null = $state(null);
	let pendingProjectId: string | null = null;

	function preventEvent(event: Event) {
		event.preventDefault();
	}

	function openModalFor(id: string) {
		console.log('Opening modal');
		selectedProjectId = id;
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
		selectedProjectId = null;
	}

	function handleClickOnBanner(id: string, alreadyCentered: boolean) {
		console.log('handle click: on banner with id: ', id, '; alreadyCentered: ', alreadyCentered);
		if (isScrollingToBanner) {
			console.log('handle click: Is already scrolling to banner');
			return;
		}
		if (alreadyCentered) {
			console.log('handle click: is already centered');
			openModalFor(id);
			return;
		}

		isScrollingToBanner = true;
		pendingProjectId = id;

		mainDivElement.addEventListener('wheel', preventEvent, { once: true });

		//TODO: PREVENT FOR SAFARI !!!
		mainDivElement.addEventListener(
			'scrollend',
			() => {
				console.log('handle click: scroll end');
				mainDivElement.removeEventListener('wheel', preventEvent);
				isScrollingToBanner = false;

				if (pendingProjectId) {
					openModalFor(pendingProjectId);
					pendingProjectId = null;
				}
			},
			{ once: true }
		);
	}

	onMount(() => {});
</script>

<div
	{@attach toMainDivElement}
	class="no-scrollbar flex h-full min-h-0 snap-y snap-mandatory flex-col gap-[2.5lvh] overflow-y-scroll py-[12.5lvh] will-change-scroll"
	onscroll={() => {
		document.documentElement.style.setProperty('--bg-y', `${-mainDivElement.scrollTop * 2.5}px`);
	}}
>
	{#each projects as p (p.id)}
		<ProjectBanner project={p} onClickBanner={handleClickOnBanner} />
	{/each}
</div>

{#if modalOpen && selectedProjectId}
	<Modal open={modalOpen} onClose={closeModal}>
		{@const details = projectDetails[selectedProjectId]}
		{#if details}
			{#if details.arrangement === 'gallery-first'}
				{#if details.gallery}
					<Gallery
						rows={details.gallery.rows}
						cols={details.gallery.cols}
						images={[...details.gallery.images]}
					/>
				{/if}
				{#if details.paragraph}
					<ParagraphBlock title={details.paragraph.title} text={details.paragraph.text} />
				{/if}
			{:else}
				{#if details.paragraph}
					<ParagraphBlock title={details.paragraph.title} text={details.paragraph.text} />
				{/if}
				{#if details.gallery}
					<Gallery
						rows={details.gallery.rows}
						cols={details.gallery.cols}
						images={[...details.gallery.images]}
					/>
				{/if}
			{/if}
		{:else}
			<ParagraphBlock text="Placeholder content" />
			<Gallery rows={1} cols={1} images={['/banners/pointclouds.jpeg']} />
		{/if}
	</Modal>
{/if}
