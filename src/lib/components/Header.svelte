<script lang="ts">
	interface HeaderProps {
		openProfile: () => void;
		styleClasses: string;
	}
	let { openProfile, styleClasses }: HeaderProps = $props();

	function onProfileClick() {
		console.log('Eliot Hoff clicked');
		openProfile();
	}
</script>

<header class="w-full text-3xl font-semibold {styleClasses} ">
	<div class="flex items-center justify-center py-12.5">
		<button
			type="button"
			class="translate-y-1.5 -rotate-90 text-7xl font-extrabold tracking-[-0.08em] text-white mix-blend-difference"
			onclick={onProfileClick}
			><span class="text-white font-stretch-expanded bg-blend-difference">EH</span></button
		>
	</div>
</header>
