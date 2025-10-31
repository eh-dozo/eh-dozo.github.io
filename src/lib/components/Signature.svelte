<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { Attachment } from 'svelte/attachments';
	import { profileOverlay, type Phase } from '$lib/stores/profileOverlay';

	let active = $state(false);
	function toggle() {
		if (overlayExpanded || overlayAnimating) return;
		active = !active;
	}

	function onKey(e: KeyboardEvent) {
		if (overlayExpanded || overlayAnimating) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggle();
		}
	}

	let overlayExpanded = $state(false);
	let overlayAnimating = $state(false);
	let phase = $state<Phase>('idle');

	let isFlipped = $state(false);

	let isCardInteractive = $derived(overlayExpanded && phase === 'expanded');

	function onCardMouseEnter() {
		if (!isCardInteractive) return;
		isFlipped = true;
	}

	function onCardMouseLeave() {
		if (!isCardInteractive) return;
		isFlipped = false;
	}

	function onFlipKeyDown(e: KeyboardEvent) {
		if (!isCardInteractive) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			isFlipped = true;
		}
	}

	function onFlipKeyUp(e: KeyboardEvent) {
		if (!isCardInteractive) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			isFlipped = false;
		}
	}

	let baseEl: HTMLDivElement;
	const toBaseEl: Attachment<HTMLDivElement> = (node) => {
		baseEl = node;
	};

	let secondSpanEl: HTMLDivElement | null = null;
	const toSecondSpanEl: Attachment<HTMLDivElement> = (node) => {
		secondSpanEl = node;
	};

	let currentAnimation: Animation | null = null;
	let secondSpanAnimation: Animation | null = null;

	let centerDeltaX = 0;
	let centerDeltaY = 0;

	const overlayState = profileOverlay.get();

	const unsub = profileOverlay.subscribe((s) => {
		overlayExpanded = s.expanded;
		overlayAnimating = s.animating;
		phase = s.phase;
	});

	onMount(() => {
		profileOverlay.registerCallbacks({
			centerSignature: animateCenterSignature,
			scaleUpSignature: animateScaleUpSignature,
			scaleDownSignature: animateScaleDownSignature,
			moveBackSignature: animateMoveBackSignature,
			fadeOutSecondSpan: animateFadeOutSecondSpan
		});

		if (typeof window !== 'undefined') {
			const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
			profileOverlay.setReducedMotion(mq.matches);
		}
	});

	onDestroy(() => {
		unsub();
		currentAnimation?.cancel();
		secondSpanAnimation?.cancel();
	});

	function animateCenterSignature(): Animation | null {
		if (!baseEl) return null;

		const rect = baseEl.getBoundingClientRect();
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const centerX = vw / 2.45;
		const centerY = vh / 2;
		const currentCenterX = rect.left + rect.width / 2;
		const currentCenterY = rect.top + rect.height / 2;

		centerDeltaX = centerX - currentCenterX;
		centerDeltaY = centerY - currentCenterY;

		const keyframes = [
			{ transform: 'translate(0px, 0px)', offset: 0 },
			{ transform: `translate(${centerDeltaX}px, ${centerDeltaY}px)`, offset: 1 }
		];

		const timing: KeyframeAnimationOptions = {
			duration: overlayState.config.centerMs,
			easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
			fill: 'forwards'
		};

		currentAnimation?.cancel();
		currentAnimation = baseEl.animate(keyframes, timing);
		return currentAnimation;
	}

	function animateScaleUpSignature(): Animation | null {
		if (!baseEl) return null;

		const rect = baseEl.getBoundingClientRect();
		const currentWidth = rect.width;
		const currentHeight = rect.height;

		const targetWidth = window.innerWidth * 0.3;
		const targetHeight = window.innerHeight * 0.22;

		const keyframes = [
			{
				transform: `translate(${centerDeltaX}px, ${centerDeltaY}px)`,
				width: `${currentWidth}px`,
				height: `${currentHeight}px`,
				offset: 0
			},
			{
				transform: `translate(${centerDeltaX}px, ${centerDeltaY}px)`,
				width: `${targetWidth}px`,
				height: `${targetHeight}px`,
				offset: 1
			}
		];

		const timing: KeyframeAnimationOptions = {
			duration: overlayState.config.scaleMs,
			easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
			fill: 'forwards'
		};

		currentAnimation?.cancel();
		currentAnimation = baseEl.animate(keyframes, timing);
		return currentAnimation;
	}

	function animateFadeOutSecondSpan(): Animation | null {
		if (!secondSpanEl) return null;

		const keyframes = [
			{ opacity: '1', offset: 0 },
			{ opacity: '0', offset: 1 }
		];

		const timing: KeyframeAnimationOptions = {
			duration: 300,
			easing: 'ease-out',
			fill: 'forwards'
		};

		secondSpanAnimation?.cancel();
		secondSpanAnimation = secondSpanEl.animate(keyframes, timing);
		return secondSpanAnimation;
	}

	function animateScaleDownSignature(): Animation | null {
		if (!baseEl) return null;

		const style = window.getComputedStyle(baseEl);
		const currentWidth = parseFloat(style.width);
		const currentHeight = parseFloat(style.height);

		// Get the target w & h (auto) by temporarily removing their current value
		// We need to measure what the natural width would be
		const baseElBoundingRect = baseEl.getBoundingClientRect();

		const tempWidth = baseEl.style.width;
		baseEl.style.width = 'auto';
		const targetWidth = baseElBoundingRect.width;
		baseEl.style.width = tempWidth;

		const tempHeigh = baseEl.style.height;
		baseEl.style.height = 'auto';
		const targetHeight = baseElBoundingRect.height;
		baseEl.style.height = tempHeigh;

		const keyframes = [
			{
				transform: `translate(${centerDeltaX}px, ${centerDeltaY}px)`,
				width: `${currentWidth}px`,
				height: `${currentHeight}px`,
				offset: 0
			},
			{
				transform: `translate(${centerDeltaX}px, ${centerDeltaY}px)`,
				width: `${targetWidth}px`,
				height: `${targetHeight}px`,
				offset: 1
			}
		];

		const timing: KeyframeAnimationOptions = {
			duration: overlayState.config.scaleMs,
			easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
			fill: 'forwards'
		};

		currentAnimation?.cancel();
		currentAnimation = baseEl.animate(keyframes, timing);
		return currentAnimation;
	}

	function animateMoveBackSignature(): Animation | null {
		if (!baseEl) return null;

		const keyframes = [
			{ transform: `translate(${centerDeltaX}px, ${centerDeltaY}px)`, offset: 0 },
			{ transform: 'translate(0px, 0px)', offset: 1 }
		];

		const timing: KeyframeAnimationOptions = {
			duration: overlayState.config.centerMs,
			easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
			fill: 'forwards'
		};

		currentAnimation?.cancel();
		currentAnimation = baseEl.animate(keyframes, timing);

		currentAnimation.finished.then(() => {
			if (baseEl) {
				baseEl.style.transform = '';
				baseEl.style.width = '';
			}
		});

		return currentAnimation;
	}
</script>

<!-- Card wrapper with perspective for 3D flip -->
<div
	{@attach toBaseEl}
	class="place-items-left absolute bottom-0 mr-[0.7lvw] mb-[1lvh] ml-[0.5lvw] grid h-auto w-auto overflow-visible rounded-sm text-left text-gray-600 mix-blend-difference select-none
		{overlayAnimating || overlayExpanded ? 'z-30' : ''}
		{isCardInteractive
		? 'cursor-pointer'
		: overlayAnimating || overlayExpanded
			? 'pointer-events-none'
			: 'cursor-pointer'}"
	class:card-perspective={isCardInteractive}
	role="button"
	aria-label={isCardInteractive ? 'Flip card' : 'Toggle signature'}
	aria-live="polite"
	aria-pressed={isCardInteractive ? isFlipped : active}
	tabindex="0"
	onclick={isCardInteractive ? undefined : toggle}
	onmouseenter={isCardInteractive ? onCardMouseEnter : undefined}
	onmouseleave={isCardInteractive ? onCardMouseLeave : undefined}
	onkeydown={isCardInteractive ? onFlipKeyDown : onKey}
	onkeyup={isCardInteractive ? onFlipKeyUp : undefined}
>
	<div
		class="card-inner relative transition-transform duration-200"
		style:transform-style="preserve-3d"
		style:transform={isCardInteractive && isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)'}
	>
		<!-- Card - Front side -->
		<div
			class="card-face card-front grid rounded-sm pt-[1lvh] inset-shadow-xs inset-shadow-gray-200"
			class:absolute={isCardInteractive}
			class:inset-0={isCardInteractive}
			style:backface-visibility="hidden"
		>
			<div
				class="col-start-1 row-start-1 transition-all duration-300 ease-out"
				style:transform={active && !overlayExpanded && !overlayAnimating
					? 'translateY(100%)'
					: 'translateY(0%)'}
				style:opacity={active && !overlayExpanded && !overlayAnimating ? 0 : 1}
			>
				<span
					class="pointer-events-none pl-[1lvw] text-6xl font-extralight tracking-wide
						{overlayExpanded && !overlayAnimating ? 'pt-[1lvh]' : ''}"
				>
					Eliot Hoff<sup>&#169;</sup></span
				>
			</div>

			{#if !isCardInteractive}
				<div
					class="col-start-1 row-start-1 flex flex-col-reverse pb-[0.7lvh] pl-[1lvw] align-middle transition-all duration-300 ease-out"
					style:transform={active && !overlayExpanded && !overlayAnimating
						? 'translateY(0%)'
						: 'translateY(-100%)'}
					style:opacity={active && !overlayExpanded && !overlayAnimating ? 1 : 0}
				>
					<span class="pointer-events-none text-xl font-light tracking-wide">
						Running with:<br />SvelteKit, Vite, TailwindCSS.</span
					>
				</div>
			{/if}

			{#if phase === 'expanded' || phase === 'hidingSecondSpan'}
				<div
					{@attach toSecondSpanEl}
					in:fade={{ duration: 300 }}
					out:fade={{ duration: 0 }}
					class="col-start-1 row-start-2"
				>
					<span
						class="align-text-middle pointer-events-none block h-1/2 pt-[1lvh] pl-[1lvw] text-xl font-light tracking-wide"
					>
						eliot.hoff.contact@gmail.com</span
					>
					<span
						class="align-text-middle pointer-events-none block h-1/2 pt-[1lvh] pl-[1lvw] text-xl font-light tracking-wide"
					>
						@dozo_ls</span
					>
				</div>
			{/if}
		</div>

		<!-- Card - Back side  -->
		{#if isCardInteractive}
			<div
				class="card-face card-back absolute inset-0 flex items-center justify-center rounded-sm text-white inset-shadow-xs inset-shadow-purple-700"
				style:backface-visibility="hidden"
				style:transform="rotateX(180deg)"
			>
				<span class="pointer-events-none px-[2lvw] text-center text-2xl font-light tracking-wide">
					Creative developer - graphics, interactions, systems.
				</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.card-perspective {
		perspective: 1000px;
	}

	.card-inner {
		transform-style: preserve-3d;
	}

	.card-face {
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
	}

	.card-front {
		z-index: 2;
	}

	.card-back {
		z-index: 1;
	}
</style>
