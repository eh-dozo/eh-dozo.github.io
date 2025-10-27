<script lang="ts">
	import type { ProjectData } from '$lib/data/projects';
	interface Props {
		project: ProjectData;
		onClickBanner: (id: string) => void;
	}
	let { project, onClickBanner }: Props = $props();

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
	class="relative w-full cursor-pointer snap-center overflow-hidden bg-cover bg-center text-left"
	style={`background-image: url('${project.image}')`}
	onclick={onClick}
>
	<div class="absolute top-10 left-10 p-4">
		<h2 class="text-8xl">{project.title}</h2>
	</div>

	<div class="absolute right-10 bottom-10 p-4 text-right">
		<span class="text-3xl">{project.dateSpan}</span>
	</div>

	<div class="min-h-[28vh] sm:min-h-[30vh] md:min-h-[32vh] lg:min-h-[60vh]"></div>
</button>
