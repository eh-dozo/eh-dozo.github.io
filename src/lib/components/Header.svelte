<script lang="ts">
	interface HeaderProps {
		openProfile: () => void;
	}
	let { openProfile }: HeaderProps = $props();

	function onProfileClick() {
		console.log('Eliot Hoff clicked');
		openProfile();
	}
</script>

<header class="flex w-full justify-center py-[7lvh]">
	<button
		type="button"
		class="-rotate-90 text-[7lvw] font-extrabold tracking-[-0.08em] text-white mix-blend-difference"
		onclick={onProfileClick}
		><span class="text-white font-stretch-expanded bg-blend-difference">EH</span></button
	>
</header>
