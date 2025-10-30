<script lang="ts">
	import type { ProjectData } from '$lib/data/projects';
	import type { Attachment } from 'svelte/attachments';
	import {
		ensureProjectImagesLoaded,
		projectImagesStatus,
		getEnhancedImageByPathOrName
	} from '$lib/util/projectImages';
	// Minimal type for enhanced image metadata used by the directive
	type EnhancedImageMeta = { src: string } & Record<string, unknown>;

	interface ProjectBannerProps {
		project: ProjectData;
		imagesProjectId: string;
		onClickBanner: (id: string, alreadyCentered: boolean, imagesProjectId: string) => void;
		/** Mark the first banner as priority to improve LCP */
		priority?: boolean;
	}
	let { project, imagesProjectId, onClickBanner, priority = false }: ProjectBannerProps = $props();

	let buttonElement: HTMLButtonElement;
	const toButtonElement: Attachment<HTMLButtonElement> = (node) => {
		buttonElement = node;
	};

	let clickedWhileLoading: boolean = $state(false);
	const shouldApplyLoadingStyle = $derived(
		Boolean($projectImagesStatus[imagesProjectId]?.loading) && clickedWhileLoading
	);

	// Resolve enhanced banner meta synchronously (works during SSR)
	const bannerMeta: EnhancedImageMeta | undefined = $derived(
		getEnhancedImageByPathOrName(project.image) as EnhancedImageMeta | undefined
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

	//TODO: since we use the scrollend event, prevent if user is using safari
	function onClick() {
		if ($projectImagesStatus[imagesProjectId]?.loading) {
			clickedWhileLoading = true;
		}
		const centered = isCentered();
		if (!centered) {
			console.log('on project banner ', project.id, ' click: scroll into');
			buttonElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
		onClickBanner(project.id, centered, imagesProjectId);
	}
</script>

<button
	{@attach toButtonElement}
	type="button"
	class="group relative isolate mx-[2lvw] min-h-[60lvh] basis-[60lvh] cursor-pointer snap-center snap-always overflow-hidden rounded-[2lvw] text-left transition-all duration-500 ease-in-out hover:project-banner-hover {shouldApplyLoadingStyle
		? 'animate-size-pulse'
		: ''}"
	class:cursor-progress={shouldApplyLoadingStyle}
	onmouseenter={onMouseEnter}
	onclick={onClick}
	style="content-visibility:auto; contain-intrinsic-size: 60lvh 100%;"
>
	<enhanced:img
		src={bannerMeta}
		alt={project.title}
		class="absolute inset-0 -z-10 size-full object-cover"
		loading={priority ? 'eager' : 'lazy'}
		fetchpriority={priority ? 'high' : 'auto'}
		decoding="async"
	/>

	<div class="absolute top-[5lvh] left-[4lvw]">
		<h2
			class="underline-gradient text-[9lvw] leading-[20vh] font-[550] tracking-tight text-white mix-blend-difference group-hover:underline-gradient-active {shouldApplyLoadingStyle
				? 'animate-opacity-pulse'
				: ''}"
		>
			{project.title}
		</h2>
	</div>

	<div class="absolute right-[3lvw] bottom-[4lvh] text-right">
		<span
			class="underline-gradient text-[2lvw] font-light text-white mix-blend-difference group-hover:underline-gradient-active {shouldApplyLoadingStyle
				? 'animate-opacity-pulse'
				: ''}">{project.dateSpan}</span
		>
	</div>
</button>
