<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { ProjectData } from '$lib/data/projects';
	let { project } = $props<{ project: ProjectData }>();

	const dispatch = createEventDispatcher<{ openProject: { id: string } }>();
	function onClick() {
		console.log('project banner clicked:', project.id);
		dispatch('openProject', { id: project.id });
	}
</script>

<button
	type="button"
	class="relative w-full cursor-pointer overflow-hidden bg-cover bg-center text-left"
	style={`background-image: url('${project.image}')`}
	onclick={onClick}
>
	<!-- Title top-left -->
	<div class="absolute top-0 left-0 p-4">
		<h2>{project.title}</h2>
	</div>

	<!-- Date bottom-right -->
	<div class="absolute right-0 bottom-0 p-4 text-right">
		<span>{project.dateSpan}</span>
	</div>

	<!-- Height to distribute vertical space responsively -->
	<div class="min-h-[28vh] sm:min-h-[30vh] md:min-h-[32vh] lg:min-h-[34vh]"></div>
</button>
