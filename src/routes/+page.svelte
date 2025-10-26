<script lang="ts">
	import { projects } from '$lib/data/projects';
	import ProjectBanner from '$lib/components/ProjectBanner.svelte';

	function handleOpenProject(e: CustomEvent<{ id: string }>) {
		console.log('open project (stub):', e.detail.id);
	}
</script>

<div class="flex flex-col gap-2 ">
	{#each projects as p (p.id)}
		<ProjectBanner project={p} on:openProject={handleOpenProject} />
	{/each}
</div>
