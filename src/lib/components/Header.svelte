<script lang="ts">
	import { onMount } from 'svelte';

	interface HeaderProps {
		openProfile: () => void;
		styleClasses: string;
	}
	let {
		openProfile,
		styleClasses
	}: HeaderProps = $props();


	function onProfileClick() {
		console.log('Eliot Hoff clicked');
		openProfile();
	}
</script>

<header
	class="sticky top-0 z-10 w-full text-3xl font-semibold {styleClasses}"
>
	<div class="flex items-center justify-between px-4 py-3 text-white">
		<div>Portfolio</div>
		<button type="button" onclick={onProfileClick}>Eliot Hoff</button>
	</div>
</header>
