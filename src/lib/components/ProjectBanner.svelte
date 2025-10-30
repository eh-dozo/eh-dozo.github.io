<script lang="ts">
	import type { ProjectData } from '$lib/data/projects';
	import type { Attachment } from 'svelte/attachments';
	import ParagraphBlock from '$lib/components/ParagraphBlock.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import { projectDetails } from '$lib/data/projectDetails';
	import type { ProjectDetails } from '$lib/data/projectDetails';
	import {
		ensureProjectImagesLoaded,
		projectImagesStatus,
		getEnhancedImageByPathOrName,
		getGalleryImages
	} from '$lib/util/projectImages';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	// Enhanced image meta comes from Vite's enhanced image plugin; treat as string here

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

	interface ProjectBannerProps {
		project: ProjectData;
		imagesProjectId: string;
		priority?: boolean;
	}
	let { project, imagesProjectId, priority = false }: ProjectBannerProps = $props();

	const dispatch = createEventDispatcher<{ expanded: { id: string }; collapsed: { id: string } }>();

	let buttonElement: HTMLDivElement;
	const toButtonElement: Attachment<HTMLDivElement> = (node) => {
		buttonElement = node;
	};

	let clickedWhileLoading: boolean = $state(false);
	let clicked: boolean = $state(false);

	const imagesLoadedForProject = $derived(Boolean($projectImagesStatus[imagesProjectId]?.loaded));
	const expanded = $derived(clicked && imagesLoadedForProject);
	const shouldApplyLoadingStyle = $derived(
		Boolean($projectImagesStatus[imagesProjectId]?.loading) && clickedWhileLoading
	);

	const hoverCls = $derived(expanded ? '' : 'hover:project-banner-hover');

	const bannerMeta: string | string = $derived(
		getEnhancedImageByPathOrName(project.image) as string | string
	);

	function isCentered(thresholdPx = 100) {
		if (!buttonElement) return false;
		const rect = buttonElement.getBoundingClientRect();
		const elementCenterY = rect.top + rect.height / 2;
		const viewportCenterY = window.innerHeight / 2;
		return Math.abs(viewportCenterY - elementCenterY) <= thresholdPx;
	}

	function onMouseEnter() {
		void ensureProjectImagesLoaded(imagesProjectId);
	}

	function collapse() {
		clicked = false;
		clickedWhileLoading = false;
		dispatch('collapsed', { id: project.id });
	}

	// Expand banner once images are loaded; keep margins like hover utility
	//TODO: since we use the scrollend event, prevent if user is using safari
	async function onClick() {
		// If not roughly centered, scroll into center first
		const centered = isCentered();
		if (!centered) {
			buttonElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}

		if (!imagesLoadedForProject) {
			clickedWhileLoading = true;
			await ensureProjectImagesLoaded(imagesProjectId);
		}
		clicked = true;
		dispatch('expanded', { id: project.id });
	}

	function onKeydownGlobal(e: KeyboardEvent) {
		if (e.key === 'Escape' && expanded) {
			collapse();
		}
	}

	function onKeydownWrapper(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			// prevent page scroll on Space
			e.preventDefault();
			onClick();
		}
	}

	function onKeydownCollapse(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			collapse();
		}
	}

	function onPointerDownGlobal(e: PointerEvent) {
		if (!expanded || !buttonElement) return;
		const path = e.composedPath();
		if (!path.includes(buttonElement)) {
			collapse();
		}
	}

	onMount(() => {
		document.addEventListener('keydown', onKeydownGlobal);
		document.addEventListener('pointerdown', onPointerDownGlobal, true);
	});

	onDestroy(() => {
		if (typeof document !== 'undefined') {
			document.removeEventListener('keydown', onKeydownGlobal);
			document.removeEventListener('pointerdown', onPointerDownGlobal, true);
		}
	});

	const detailsForBanner: ProjectDetails | undefined = $derived(projectDetails[project.id]);
	const contentItems: ContentItem[] = $derived(
		detailsForBanner ? composeContent(detailsForBanner) : []
	);
</script>

<div
	{@attach toButtonElement}
	role="button"
	tabindex="0"
	aria-expanded={expanded}
	class="group relative isolate mx-[2lvw] min-h-[60lvh] basis-[60lvh] snap-center snap-always overflow-hidden rounded-[2lvw] text-left transition-all duration-500 ease-in-out {shouldApplyLoadingStyle
		? 'animate-size-pulse'
		: ''} {expanded
		? 'z-20 min-h-[80lvh] basis-[80lvh] cursor-default overflow-y-auto'
		: 'cursor-pointer'} {hoverCls}"
	class:cursor-progress={shouldApplyLoadingStyle}
	onmouseenter={onMouseEnter}
	onclick={onClick}
	onkeydown={onKeydownWrapper}
	style="content-visibility:auto; contain-intrinsic-size: {expanded
		? '80lvh 100%'
		: '60lvh 100%'}; margin: {expanded ? '0.5lvw' : ''};"
>
	<enhanced:img
		src={bannerMeta}
		alt={project.title}
		class="absolute inset-0 -z-10 size-full object-cover"
		loading={priority ? 'eager' : 'lazy'}
		fetchpriority={priority ? 'high' : 'auto'}
		decoding="async"
	/>

	<div class="absolute top-[5lvh] right-[4lvw] left-[4lvw]">
		<h2
			class="underline-gradient text-[9lvw] leading-[20vh] font-[550] tracking-tight text-white mix-blend-difference group-hover:underline-gradient-active {shouldApplyLoadingStyle
				? 'animate-opacity-pulse'
				: ''} {expanded ? 'text-right' : ''}"
		>
			{project.title}
		</h2>
	</div>

	{#if !expanded}
		<div class="absolute right-[3lvw] bottom-[4lvh] text-right">
			<span
				class="underline-gradient text-[2lvw] font-light text-white mix-blend-difference group-hover:underline-gradient-active {shouldApplyLoadingStyle
					? 'animate-opacity-pulse'
					: ''}"
				transition:fade={{ duration: 200 }}>{project.dateSpan}</span
			>
		</div>
	{/if}

	{#if expanded}
		<div
			role="button"
			tabindex="0"
			aria-label="Collapse"
			class="absolute top-[2lvh] left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-white backdrop-blur-sm"
			onclick={collapse}
			onkeydown={onKeydownCollapse}
		>
			⯆
		</div>
	{/if}

	{#if expanded && imagesLoadedForProject && detailsForBanner}
		{@const content = contentItems}
		<div
			class="relative z-10 mt-[22lvh] flex flex-col gap-4 pt-[4lvh]"
			in:fade={{ duration: 500 }}
			out:fade={{ duration: 200 }}
		>
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
						images={getGalleryImages(detailsForBanner.id, item.idx) ?? []}
					/>
				{/if}
			{/each}
		</div>
	{/if}
</div>
