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
	import { ChevronsDownUp } from '@lucide/svelte';
	import { circOut } from 'svelte/easing';
	import {
		registerBanner,
		unregisterBanner,
		notifyExpanded,
		notifyCollapsed,
		requestCollapseAndWait
	} from '$lib/stores/bannerCoordinator';

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

	let scrollContainer: HTMLDivElement;
	const toScrollContainer: Attachment<HTMLDivElement> = (node) => {
		scrollContainer = node;
	};

	function animateScrollToTop(el: HTMLElement, duration = 300): Promise<void> {
		const start = el.scrollTop;
		if (start <= 0) return Promise.resolve();
		const startTime = performance.now();
		const easeOutCirc = (t: number) => t * t;
		return new Promise((resolve) => {
			function step(now: number) {
				const elapsed = now - startTime;
				const progress = Math.min(elapsed / duration, 1);
				const eased = easeOutCirc(progress);
				el.scrollTop = start * (1 - eased);
				if (progress < 1) requestAnimationFrame(step);
				else resolve();
			}
			requestAnimationFrame(step);
		});
	}

	const TRANSITION_MS = 500;
	function waitForTransitionEnd(el: HTMLElement, maxMs = TRANSITION_MS + 120): Promise<void> {
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

	function getScrollParent(el: HTMLElement | null): HTMLElement | Window {
		let node: HTMLElement | null = el?.parentElement ?? null;
		while (node) {
			const style = getComputedStyle(node);
			const overflowY = style.overflowY;
			const canScroll =
				(overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight;
			if (canScroll) return node;
			node = node.parentElement;
		}
		return window;
	}

	function waitForScrollToCenter(
		el: HTMLElement,
		thresholdPx = 10,
		idleMs = 120,
		timeoutMs = 1500
	): Promise<void> {
		const scroller = getScrollParent(el);
		let lastScroll = performance.now();
		let raf = 0;
		let resolved = false;

		const isNowCentered = () => {
			const rect = el.getBoundingClientRect();
			const elementCenterY = rect.top + rect.height / 2;
			const viewportCenterY = window.innerHeight / 2;
			return Math.abs(viewportCenterY - elementCenterY) <= thresholdPx;
		};

		return new Promise((resolve) => {
			const done = () => {
				if (resolved) return;

				resolved = true;

				// cleanup
				if (raf) cancelAnimationFrame(raf);
				if (scroller instanceof Window) {
					window.removeEventListener('scroll', onScroll, {
						capture: true
					} as AddEventListenerOptions);
					window.removeEventListener?.('scrollend', onScrollEnd, {
						capture: true
					} as AddEventListenerOptions);
				} else {
					scroller.removeEventListener('scroll', onScroll, {
						capture: true
					} as AddEventListenerOptions);
					scroller.removeEventListener?.('scrollend', onScrollEnd, {
						capture: true
					} as AddEventListenerOptions);
				}

				resolve();
			};

			const onScroll = () => {
				lastScroll = performance.now();

				//queueCheck
				if (raf) return;
				raf = requestAnimationFrame(() => {
					raf = 0;
					const elapsed = performance.now() - lastScroll;
					if (elapsed >= idleMs && isNowCentered()) done();
				});
			};

			const onScrollEnd = () => {
				if (isNowCentered()) done();
			};

			if (scroller instanceof Window) {
				window.addEventListener('scroll', onScroll, {
					capture: true,
					passive: true
				} as AddEventListenerOptions);
				window.addEventListener?.('scrollend', onScrollEnd, {
					capture: true
				} as AddEventListenerOptions);
			} else {
				scroller.addEventListener('scroll', onScroll, {
					capture: true,
					passive: true
				} as AddEventListenerOptions);
				scroller.addEventListener?.('scrollend', onScrollEnd, {
					capture: true
				} as AddEventListenerOptions);
			}

			// i.e. if already centered
			if (isNowCentered()) {
				setTimeout(() => done(), idleMs);
			}

			setTimeout(done, timeoutMs);
		});
	}

	let clickedWhileLoading: boolean = $state(false);
	let clicked: boolean = $state(false);

	const imagesLoadedForProject = $derived(Boolean($projectImagesStatus[imagesProjectId]?.loaded));
	const expanded = $derived(clicked && imagesLoadedForProject);
	const shouldApplyLoadingStyle = $derived(
		Boolean($projectImagesStatus[imagesProjectId]?.loading) && clickedWhileLoading
	);
	const shouldDisablePointerEvent = $derived(false);

	const hoverCls = $derived(expanded ? '' : 'hover:project-banner-hover');

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
	}

	async function collapse() {
		if (scrollContainer) {
			try {
				await animateScrollToTop(scrollContainer, 200);
			} catch {
				/* empty */
			}
			scrollContainer.scrollTop = 0;
		}

		clicked = false;
		clickedWhileLoading = false;

		dispatch('collapsed', { id: project.id });

		if (buttonElement) {
			await waitForTransitionEnd(buttonElement);
		} else {
			await new Promise((r) => setTimeout(r, TRANSITION_MS + 120));
		}
		notifyCollapsed(project.id);
	}

	// Expands only after both scroll-to-center and images load have finished
	async function onClick() {
		await requestCollapseAndWait(project.id);
		notifyExpanded(project.id);

		// Start image loading as early as possible
		let imagesPromise: Promise<unknown> | null = null;
		if (!imagesLoadedForProject) {
			clickedWhileLoading = true;
			imagesPromise = ensureProjectImagesLoaded(imagesProjectId);
		}

		// If not centered, scroll into view and wait for settling
		if (!isCentered()) {
			buttonElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			await waitForScrollToCenter(buttonElement);
		}

		if (imagesPromise) {
			try {
				await imagesPromise;
			} catch {
				/* empty */
			}
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

<!-- TODO set smaller border radius when expanded -->
<div
	{@attach toButtonElement}
	role="button"
	tabindex="0"
	aria-expanded={expanded}
	onmouseenter={onMouseEnter}
	onclick={onClick}
	onkeydown={onKeydownWrapper}
	class="group relative isolate mx-[2lvw] min-h-[60lvh] basis-[60lvh] snap-center snap-always overflow-hidden rounded-[2lvw] text-left transition-all duration-500 ease-in-out
		{shouldApplyLoadingStyle ? 'animate-size-pulse' : ''} 
		{shouldDisablePointerEvent ? 'pointer-events-none' : ''}
		{expanded ? 'z-20 min-h-[80lvh] basis-[80lvh] cursor-default' : 'cursor-pointer'}
		{hoverCls}"
	class:cursor-progress={shouldApplyLoadingStyle}
	style="content-visibility:auto; 
		contain-intrinsic-size: {expanded ? '80lvh 100%' : '60lvh 100%'}; 
		margin: {expanded ? '0.5lvw' : ''};"
>
	<enhanced:img
		src={bannerMeta}
		alt={project.title}
		class="absolute inset-0 -z-10 size-full object-cover transition-[filter] duration-200 ease-linear
			{expanded ? 'blur-3xl' : 'blur-0'}"
		loading={priority ? 'eager' : 'lazy'}
		fetchpriority={priority ? 'high' : 'auto'}
		decoding="async"
	/>

	{#if expanded}
		<div
			role="button"
			tabindex="0"
			aria-label="Collapse"
			class="sticky top-0 z-20 w-[2lvw] rotate-45 place-self-end rounded-full pt-[3lvh] pr-[3lvw]"
			onclick={collapse}
			onkeydown={onKeydownCollapse}
		>
			<ChevronsDownUp size={64} />
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
				{project.title}
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
				in:fade={{ duration: 1000, easing: circOut }}
				out:fade={{ duration: 200 }}
			>
				<div>
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
			</div>
		{/if}
	</div>
</div>
