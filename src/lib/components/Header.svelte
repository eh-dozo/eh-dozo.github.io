<script lang="ts">
	interface HeaderProps {
		openProfile: () => void;
		expanded?: boolean;
		animating?: boolean;
	}
	let { openProfile, expanded = false, animating = false }: HeaderProps = $props();

	function onProfileClick() {
		if (animating) return;
		openProfile();
	}
</script>

<header class="flex w-full justify-center py-[7lvh]">
	<div
		class="absolute h-[19lvh] w-[7lvw] -translate-x-0.5 rounded-lg inset-shadow-xs inset-shadow-gray-200"
	></div>
	<button
		type="button"
		class="-rotate-90 text-[7lvw] font-extrabold tracking-[-0.08em] text-white mix-blend-difference {animating
			? 'cursor-not-allowed opacity-50'
			: ''}"
		aria-pressed={expanded}
		aria-disabled={animating}
		disabled={animating}
		onclick={onProfileClick}
		><span class="text-white font-stretch-expanded bg-blend-difference">EH</span></button
	>
</header>
