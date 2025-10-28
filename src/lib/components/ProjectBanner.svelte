<script lang="ts">
	import type { ProjectData } from '$lib/data/projects';

	interface ProjectBannerProps {
		project: ProjectData;
		onClickBanner: (id: string) => void;
	}
	let { project, onClickBanner }: ProjectBannerProps = $props();

	let buttonElement: HTMLButtonElement;

	export function scrollIntoView() {
		buttonElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	//TODO: since we use the scrollend event, prevent if user is using safari
	function onClick() {
		console.log('project banner clicked:', project.id);
		scrollIntoView();
		onClickBanner(project.id);
	}
</script>

<button
	bind:this={buttonElement}
	type="button"
	class="
	relative
		isolate min-h-[60svh] w-full basis-[60svh]
		cursor-pointer
		snap-center snap-always scroll-m-50
		overflow-hidden
		rounded-4xl bg-cover
		bg-center
		text-left"
	style={`background-image: url('${project.image}')`}
	onclick={onClick}
>
	<div class="absolute top-10 left-10 p-4">
		<h2
			class="font-[550] tracking-tight text-white mix-blend-difference md:text-8xl lg:text-[156px]"
		>
			{project.title}
		</h2>
	</div>

	<div class="absolute right-10 bottom-10 p-4 text-right">
		<span class="text-3xl text-white mix-blend-difference">{project.dateSpan}</span>
	</div>
</button>
