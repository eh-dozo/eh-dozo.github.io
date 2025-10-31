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
