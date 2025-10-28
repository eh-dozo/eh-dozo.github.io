<script lang="ts">
	import type { ProjectData } from '$lib/data/projects';
	import type { Attachment } from 'svelte/attachments';

	interface ProjectBannerProps {
		project: ProjectData;
		onClickBanner: (id: string, alreadyCentered: boolean) => void;
	}
	let { project, onClickBanner }: ProjectBannerProps = $props();

	let buttonElement: HTMLButtonElement;
	const toButtonElement: Attachment<HTMLButtonElement> = (node) => {
		buttonElement = node;
	};

	function isCentered(thresholdPx = 100) {
		if (!buttonElement) return false;
		const rect = buttonElement.getBoundingClientRect();
		const elementCenterY = rect.top + rect.height / 2;
		const viewportCenterY = window.innerHeight / 2;
		return Math.abs(viewportCenterY - elementCenterY) <= thresholdPx;
	}

	//TODO: since we use the scrollend event, prevent if user is using safari
	function onClick() {
		const centered = isCentered();
		if (!centered) {
			console.log('on project banner ', project.id, ' click: scroll into');
			buttonElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
		onClickBanner(project.id, centered);
	}
</script>

<button
	{@attach toButtonElement}
	type="button"
	class="relative isolate min-h-[60lvh] w-full basis-[60lvh] cursor-pointer snap-center snap-always overflow-hidden rounded-[2lvw] bg-cover bg-center text-left"
	style={`background-image: url('${project.image}')`}
	onclick={onClick}
>
	<div class="absolute top-[5lvh] left-[4lvw]">
		<h2
			class="text-[9lvw] leading-[20vh] font-[550] tracking-tight text-white mix-blend-difference"
		>
			{project.title}
		</h2>
	</div>

	<div class="absolute right-[3lvw] bottom-[4lvh] text-right">
		<span class="text-[2lvw] font-extralight text-white mix-blend-difference"
			>{project.dateSpan}</span
		>
	</div>
</button>
