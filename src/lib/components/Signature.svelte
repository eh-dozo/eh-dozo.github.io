<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { Attachment } from 'svelte/attachments';
	import { profileOverlay, type Phase } from '$lib/stores/profileOverlay';

	const OVERLAY_SUBTITLE = 'Creative developer — graphics, interactions, systems.'; // TODO: replace with final copy

	let active = $state(false);
	function toggle() {
		if (overlayExpanded || overlayAnimating) return; // disabled while overlay active
		active = !active;
	}

	function onKey(e: KeyboardEvent) {
		if (overlayExpanded || overlayAnimating) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggle();
		}
	}

	// Overlay coordination
	let overlayExpanded = $state(false);
	let overlayAnimating = $state(false);
	let phase: Phase = $state('idle');

	let baseEl: HTMLDivElement;
	const toBaseEl: Attachment<HTMLDivElement> = (node) => {
		baseEl = node;
	};
	let overlayVisible = $state(false);
	let dx = $state(0);
	let dy = $state(0);
	let scale = $state(1);

	const unsub = profileOverlay.subscribe((s) => {
		overlayExpanded = s.expanded;
		overlayAnimating = s.animating;
		phase = s.phase;
		// Trigger phase handlers
		if (s.phase === 'centeringSignature') {
			startCentering();
		} else if (s.phase === 'scalingSignature') {
			startScalingUp();
		} else if (s.phase === 'scalingDown') {
			startScalingDown();
		} else if (s.phase === 'movingBack') {
			startMovingBack();
		}
	});

	onMount(() => {
		// prefers-reduced-motion handling
		if (typeof window !== 'undefined') {
			const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
			profileOverlay.setReducedMotion(mq.matches);
		}
	});

	onDestroy(() => {
		unsub();
	});

	async function startCentering() {
		if (!baseEl) return;
		const rect = baseEl.getBoundingClientRect();
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const centerX = vw / 2;
		const centerY = vh / 2;
		const origCenterX = rect.left + rect.width / 2;
		const origCenterY = rect.top + rect.height / 2;
		dx = origCenterX - centerX;
		dy = origCenterY - centerY;
		scale = 1;
		overlayVisible = true;
		await tick();
		// Begin transition to center
		requestAnimationFrame(() => {
			dx = 0;
			dy = 0;
		});
	}

	async function startScalingUp() {
		if (!baseEl) return;
		const rect = baseEl.getBoundingClientRect();
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const targetScale = Math.min((0.5 * vw) / rect.width, (0.5 * vh) / rect.height);
		await tick();
		requestAnimationFrame(() => {
			scale = targetScale;
		});
	}

	async function startScalingDown() {
		await tick();
		requestAnimationFrame(() => {
			scale = 1;
		});
	}

	async function startMovingBack() {
		if (!baseEl) return;
		const rect = baseEl.getBoundingClientRect();
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const centerX = vw / 2;
		const centerY = vh / 2;
		const origCenterX = rect.left + rect.width / 2;
		const origCenterY = rect.top + rect.height / 2;
		await tick();
		requestAnimationFrame(() => {
			dx = origCenterX - centerX;
			dy = origCenterY - centerY;
		});
	}
</script>

<!-- Base signature (hidden when overlayVisible to avoid duplication) -->
<div
	{@attach toBaseEl}
	class="place-items-left absolute bottom-0 mr-[0.7lvw] mb-[1lvh] ml-[0.5lvw] grid h-auto w-auto cursor-pointer overflow-visible rounded-sm pt-[1lvh] text-left text-gray-600 mix-blend-difference inset-shadow-xs inset-shadow-gray-200 select-none"
	role="button"
	aria-label="Toggle signature"
	aria-live="polite"
	aria-pressed={active}
	tabindex="0"
	style:visibility={overlayVisible ? 'hidden' : 'visible'}
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

<!-- Overlay signature used for centering/scaling and expanded state -->
{#if overlayVisible}
	<div class="pointer-events-none fixed inset-0 z-30">
		<div
			class="absolute transition-transform duration-[650ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
			style:left="50lvw"
			style:top="50lvh"
			style:transform={`translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${scale})`}
			ontransitionend={() => {
				if (phase === 'centeringSignature') profileOverlay.centerDone();
				else if (phase === 'scalingSignature') profileOverlay.scaleUpDone();
				else if (phase === 'scalingDown') profileOverlay.scaleDownDone();
				else if (phase === 'movingBack') {
					profileOverlay.moveBackDone();
					// Hide overlay after returning
					overlayVisible = false;
				}
			}}
		>
			<!-- Primary line -->
			<div class="grid select-none">
				<span class="pointer-events-none pl-[1lvw] text-6xl font-extralight tracking-wide"
					>Eliot Hoff<sup>&#169;</sup></span
				>
			</div>

			<!-- Secondary line appears only when expanded; fades in and will fade out first on toggle out -->
			{#if phase === 'expanded'}
				<div
					in:fade={{ duration: 300 }}
					out:fade={{ duration: 300 }}
					onoutroend={() => {
						if (phase === 'hidingSecondSpan') profileOverlay.secondSpanHiddenDone();
					}}
				>
					<span
						class="pointer-events-none block pt-[1lvh] pl-[1lvw] text-xl font-light tracking-wide"
						>{OVERLAY_SUBTITLE}</span
					>
				</div>
			{/if}
		</div>
	</div>
{/if}
