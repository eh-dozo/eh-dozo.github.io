<script lang="ts">
	import sanitize from 'sanitize-html';
	import type { ProjectData } from '$lib/data/projects';
	import type { Attachment } from 'svelte/attachments';
	import ParagraphBlock from '$lib/components/ParagraphBlock.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import { projectDetails } from '$lib/data/projectDetails';
	import type { ProjectDetails } from '$lib/data/projectDetails';
	import {
		ensureProjectImagesLoaded,
		ensureProjectMediaLoaded,
		projectImagesStatus,
		getEnhancedImageByPathOrName,
		getGalleryImages,
		getGalleryMedia
	} from '$lib/util/projectImages';
	import { animateScrollToTop, getMainScroller, scrollElementToCenter } from '$lib/util/scroll';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { ChevronsDownUp } from '@lucide/svelte';
	import { sineIn } from 'svelte/easing';
	import {
		registerBanner,
		unregisterBanner,
		notifyExpanded,
		notifyCollapsed,
		requestCollapseAndWait
	} from '$lib/stores/bannerCoordinator';
	import { profileOverlay } from '$lib/stores/profileOverlay';

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
		isNeighbordExpanded: boolean;
		priority?: boolean;
	}
	let {
		project,
		imagesProjectId,
		isNeighbordExpanded,
		priority = false
	}: ProjectBannerProps = $props();

	const FALLBACK_TRANSITION_DURATION_COLLAPSE = 500;
	//const FALLBACK_TRANSITION_DURATION_ACTIVE = 250;

	const dispatch = createEventDispatcher<{ expanded: { id: string }; collapsed: { id: string } }>();

	let buttonElement: HTMLDivElement;
	const toButtonElement: Attachment<HTMLDivElement> = (node) => {
		buttonElement = node;
	};

	let scrollContainer: HTMLDivElement;
	const toScrollContainer: Attachment<HTMLDivElement> = (node) => {
		scrollContainer = node;
	};

	function waitForTransitionEnd(
		el: HTMLElement,
		maxMs = FALLBACK_TRANSITION_DURATION_COLLAPSE + 120
	): Promise<void> {
		return new Promise((resolve) => {
			let resolved = false;
			const done = () => {
				if (resolved) return;
				resolved = true;
				el.removeEventListener('transitionend', onEnd);
				resolve();
			};
			const onEnd = () => {
				console.log('transitionend did fire');
				done();
			};
			el.addEventListener('transitionend', onEnd, { once: true });
			console.log('transitionend did not fire');
			setTimeout(done, maxMs);
		});
	}

	let clickedWhileLoading: boolean = $state(false);
	let clicked: boolean = $state(false);
	let isScrolling: boolean = $state(false);
	let videoElements: HTMLVideoElement[] = [];

	const imagesLoadedForProject = $derived(Boolean($projectImagesStatus[imagesProjectId]?.loaded));
	const expanded = $derived(clicked && imagesLoadedForProject);
	const shouldApplyLoadingStyle = $derived(
		Boolean($projectImagesStatus[imagesProjectId]?.loading) && clickedWhileLoading
	);
	const overlayState = $derived($profileOverlay);
	const shouldDisablePointerEvent = $derived(
		((clickedWhileLoading || isScrolling) && !isCentered()) ||
			overlayState.animating ||
			(overlayState.expanded && overlayState.phase !== 'idle')
	);

	const bannerMeta: string | string = $derived(
		getEnhancedImageByPathOrName(project.image) as string | string
	);

	function isCentered(thresholdPx = 10) {
		if (!buttonElement) return false;
		const rect = buttonElement.getBoundingClientRect();
		const elementCenterY = rect.top + rect.height / 2;
		const viewportCenterY = window.innerHeight / 2;
		return Math.abs(viewportCenterY - elementCenterY) <= thresholdPx;
	}

	function onMouseEnter() {
		void ensureProjectImagesLoaded(imagesProjectId);
		void ensureProjectMediaLoaded(imagesProjectId);
	}

	function waitForVideosReady(): Promise<void> {
		if (videoElements.length === 0) {
			return Promise.resolve();
		}

		const promises = videoElements.map((video) => {
			return new Promise<void>((resolve) => {
				if (video.readyState >= 3) {
					// HAVE_FUTURE_DATA or better
					resolve();
				} else {
					const onCanPlay = () => {
						video.removeEventListener('canplaythrough', onCanPlay);
						resolve();
					};
					video.addEventListener('canplaythrough', onCanPlay);
				}
			});
		});

		return Promise.all(promises).then(() => {});
	}

	async function collapse(e?: MouseEvent | KeyboardEvent) {
		if (e) {
			e.stopPropagation();
		}

		if (scrollContainer) {
			try {
				await animateScrollToTop(scrollContainer, 600);
				setTimeout(() => {}, 300);
			} catch {
				/* empty */
			}
			scrollContainer.scrollTop = 0;
		}

		clicked = false;
		clickedWhileLoading = false;
		videoElements = [];

		dispatch('collapsed', { id: project.id });

		if (buttonElement) {
			await waitForTransitionEnd(buttonElement);
		} else {
			await new Promise((r) => setTimeout(r, FALLBACK_TRANSITION_DURATION_COLLAPSE + 120));
		}
		notifyCollapsed(project.id);
	}

	async function onClick() {
		await requestCollapseAndWait(project.id);
		notifyExpanded(project.id);

		let imagesPromise: Promise<unknown> | null = null;
		let mediaPromise: Promise<unknown> | null = null;

		if (!imagesLoadedForProject) {
			clickedWhileLoading = true;
			imagesPromise = ensureProjectImagesLoaded(imagesProjectId);
			mediaPromise = ensureProjectMediaLoaded(imagesProjectId);
		}

		if (!isCentered()) {
			const scroller = getMainScroller();
			if (scroller) {
				isScrolling = true;
				try {
					await scrollElementToCenter(scroller, buttonElement, 750);
				} finally {
					isScrolling = false;
				}
			} else {
				// Fallback but not supported by Safari..
				buttonElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}

		if (imagesPromise) {
			try {
				await imagesPromise;
			} catch {
				/* empty */
			}
		}

		if (mediaPromise) {
			try {
				await mediaPromise;
			} catch {
				/* empty */
			}
		}

		// video auto-play tick delay
		await new Promise((resolve) => setTimeout(resolve, 50));

		if (buttonElement) {
			videoElements = Array.from(buttonElement.querySelectorAll('video'));
		}

		try {
			await waitForVideosReady();
		} catch {
			/* empty */
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
		registerBanner(project.id, collapse);
		document.addEventListener('keydown', onKeydownGlobal);
		document.addEventListener('pointerdown', onPointerDownGlobal, true);
	});

	onDestroy(() => {
		unregisterBanner(project.id);
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
	onmouseenter={onMouseEnter}
	onclick={onClick}
	onkeydown={onKeydownWrapper}
	class="group relative isolate mx-[2lvw] min-h-[60lvh] snap-center snap-always overflow-hidden rounded-[1lvw] text-left drop-shadow-lg transition-all duration-500 ease-in-out hover:drop-shadow-lg/50
		{isNeighbordExpanded
		? ''
		: 'active:ease-[cubic-bezier(0, 0.55, 0.45, 1)] active:mx-[4lvw] active:mt-[2lvh] active:min-h-[57lvh] active:duration-150'}
		{shouldApplyLoadingStyle ? 'animate-size-pulse' : ''} 
		{shouldDisablePointerEvent ? 'pointer-events-none' : ''}
		{expanded
		? 'z-20 min-h-[80lvh] basis-[80lvh] cursor-default rounded-[0.5lvw]'
		: 'cursor-pointer hover:project-banner-hover'}
		"
	class:cursor-progress={shouldApplyLoadingStyle}
	style="content-visibility:auto; 
		contain-intrinsic-size: {expanded ? '80lvh 100%' : '60lvh 100%'}; 
		margin: {expanded ? '0.5lvw' : ''};"
>
	<enhanced:img
		src={bannerMeta}
		alt={project.title}
		class="absolute inset-0 -z-10 size-full object-cover transition-[filter] duration-200 ease-linear
			{expanded ? 'blur-lg' : 'blur-0'}"
		loading={priority ? 'eager' : 'lazy'}
		fetchpriority={priority ? 'high' : 'auto'}
		decoding="async"
	/>

	{#if expanded}
		<div
			role="button"
			tabindex="0"
			aria-label="Collapse"
			class="sticky top-[2lvh] right-0 z-20 m-[0.6lvw] w-auto rotate-45 cursor-pointer place-self-end rounded-full mix-blend-difference"
			onclick={collapse}
			onkeydown={onKeydownCollapse}
		>
			<ChevronsDownUp size={64} class="text-white" />
		</div>
	{/if}

	<div
		{@attach toScrollContainer}
		class="absolute inset-0
			{expanded ? 'h-full overflow-y-auto overscroll-contain' : ''}"
	>
		<div
			class="relative right-[4lvw] left-[4lvw] pt-[5lvh] pb-[3lvh] text-balance transition-transform duration-500 ease-in-out"
		>
			<h2
				class="underline-gradient text-[9lvw] leading-[20vh] font-[550] tracking-tight text-white mix-blend-difference group-hover:underline-gradient-active
					{shouldApplyLoadingStyle ? 'animate-opacity-pulse' : ''}"
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html sanitize(project.title)}
			</h2>
		</div>

		{#if !expanded}
			<div class="absolute right-[3lvw] bottom-[4lvh] text-right">
				<span
					class="underline-gradient text-[2lvw] font-light text-white mix-blend-difference group-hover:underline-gradient-active
						{shouldApplyLoadingStyle ? 'animate-opacity-pulse' : ''}"
					in:fade={{ duration: 350 }}
					out:fade={{ duration: 100 }}>{project.dateSpan}</span
				>
			</div>
		{/if}

		{#if expanded && imagesLoadedForProject && detailsForBanner}
			{@const content = contentItems}
			<div
				class="relative z-10 mt-0 flex flex-col gap-4 pt-0"
				in:fade={{ duration: 200, delay: 500, easing: sineIn }}
				out:fade={{ duration: 200 }}
			>
				<div class="mix-blend-difference">
					{#each content as item (item.kind === 'paragraph' ? `p-${item.idx}` : `g-${item.idx}`)}
						{#if item.kind === 'paragraph'}
							<ParagraphBlock
								title={item.data.title}
								text={item.data.text}
								textJustify={item.data.textJustify}
							/>
						{:else}
							{@const mediaItems = getGalleryMedia(detailsForBanner.id, item.idx)}
							{#if mediaItems && mediaItems.length > 0}
								<Gallery rows={item.data.maxRows} cols={item.data.maxCols} media={mediaItems} />
							{:else}
								{@const imageItems = getGalleryImages(detailsForBanner.id, item.idx) ?? []}
								<Gallery
									rows={item.data.maxRows}
									cols={item.data.maxCols}
									media={imageItems.map((src) => ({ type: 'image' as const, src }))}
								/>
							{/if}
						{/if}
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
