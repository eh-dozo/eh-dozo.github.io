<script lang="ts">
	interface HeaderProps {
		openProfile: () => void;
		expanded?: boolean;
		animating?: boolean;
	}
	let { openProfile, expanded = false, animating = false }: HeaderProps = $props();

	let isHovered = $state(false);
	let isPressed = $state(false);

	function onProfileClick() {
		if (animating) return;
		openProfile();
	}
</script>

<header
	class="ease-[cubic-bezier(0.25, 1, 0.5, 1)] flex w-full justify-center py-[7lvh] mix-blend-difference transition-transform duration-100
	{isPressed ? 'translate-y-5' : ''}"
>
	<div
		class="absolute h-[19lvh] w-[7lvw] -translate-x-0.5 rounded-lg inset-shadow-xs inset-shadow-gray-200"
	></div>
	<button
		type="button"
		class="ease-[cubic-bezier(0.32, 0, 0.67, 0)] -rotate-90 text-[7lvw] font-extrabold tracking-[-0.08em] text-white mix-blend-difference transition-transform duration-200
		{animating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
		{isHovered ? 'scale-110' : ''}"
		aria-pressed={expanded}
		aria-disabled={animating}
		disabled={animating}
		onclick={onProfileClick}
		onmouseenter={() => {
			if (!animating) isHovered = true;
		}}
		onmouseleave={() => {
			isHovered = false;
			isPressed = false;
		}}
		onmousedown={() => {
			if (!animating) isPressed = true;
		}}
		onmouseup={() => {
			isPressed = false;
		}}><span class="text-white font-stretch-expanded bg-blend-difference">EH</span></button
	>
</header>
