<script lang="ts">
	let active = $state(false);
	function toggle() {
		active = !active;
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggle();
		}
	}
</script>

<div
	class="place-items-left absolute bottom-0 mr-[0.7lvw] mb-[1lvh] ml-[0.5lvw] grid h-auto w-auto cursor-pointer overflow-visible rounded-sm pt-[1lvh] text-left text-gray-600 mix-blend-difference inset-shadow-xs inset-shadow-gray-200 select-none"
	role="button"
	aria-label="Toggle signature"
	aria-live="polite"
	aria-pressed={active}
	tabindex="0"
	onclick={toggle}
	onkeydown={onKey}
>
	<div
		class="col-start-1 row-start-1 transition-all duration-300 ease-out"
		style:transform={active ? 'translateY(100%)' : 'translateY(0%)'}
		style:opacity={active ? 0 : 1}
	>
		<span class="pointer-events-none pl-[1lvw] text-6xl font-extralight tracking-wide"
			>Eliot Hoff<sup>&#169;</sup></span
		>
	</div>
	<div
		class="col-start-1 row-start-1 flex flex-col-reverse pb-[0.7lvh] pl-[1lvw] align-middle transition-all duration-300 ease-out"
		style:transform={active ? 'translateY(0%)' : 'translateY(-100%)'}
		style:opacity={active ? 1 : 0}
	>
		<span class="pointer-events-none text-xl font-light tracking-wide"
			>Running with:<br />SvelteKit, Vite, TailwindCSS.</span
		>
	</div>
</div>
