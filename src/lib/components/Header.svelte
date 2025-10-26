<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher<{ openProfile: void }>();

	function onProfileClick() {
		console.log('Eliot Hoff clicked');
		dispatch('openProfile');
	}
</script>

<header class="sticky top-0 z-10 w-full">
	<div class="flex items-center justify-between px-4 py-3">
		<div>Portfolio</div>
		<button type="button" onclick={onProfileClick}>Eliot Hoff</button>
	</div>
</header>
