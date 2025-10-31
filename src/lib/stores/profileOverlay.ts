import { writable, type Readable } from 'svelte/store';
import { requestCollapseAndWait } from '$lib/stores/bannerCoordinator';

export type Phase =
	| 'idle'
	| 'collapsingBanner'
	| 'fadingBannersOut'
	| 'centeringSignature'
	| 'scalingSignature'
	| 'expanded'
	| 'hidingSecondSpan'
	| 'scalingDown'
	| 'movingBack'
	| 'fadingBannersIn';

export type Direction = 'in' | 'out' | 'none';

export interface OverlayState {
	expanded: boolean;
	animating: boolean;
	phase: Phase;
	direction: Direction;
	bannerCount: number;
	config: {
		fadeMs: number;
		staggerMs: number;
		centerMs: number;
		scaleMs: number;
		bufferMs: number;
	};
	reducedMotion: boolean;
}

function wait(ms: number) {
	return new Promise<void>((r) => setTimeout(r, ms));
}

function createCompleter() {
	let resolve!: () => void;
	const p = new Promise<void>((r) => (resolve = r));
	return [p, resolve] as const;
}

function createProfileOverlay() {
	const { subscribe, update } = writable<OverlayState>({
		expanded: false,
		animating: false,
		phase: 'idle',
		direction: 'none',
		bannerCount: 0,
		config: { fadeMs: 300, staggerMs: 500, centerMs: 650, scaleMs: 650, bufferMs: 50 },
		reducedMotion: false
	});

	// Imperative phase completion resolvers signaled by Signature.svelte
	let centerDoneResolve: (() => void) | null = null;
	let scaleUpDoneResolve: (() => void) | null = null;
	let secondSpanHiddenResolve: (() => void) | null = null;
	let scaleDownDoneResolve: (() => void) | null = null;
	let moveBackDoneResolve: (() => void) | null = null;

	function setBannerCount(count: number) {
		update((s) => ({ ...s, bannerCount: count }));
	}

	function setReducedMotion(value: boolean) {
		update((s) => ({ ...s, reducedMotion: value }));
	}

	async function toggle() {
		let current: OverlayState;
		subscribe((s) => (current = s))(); // immediate get snapshot
		if (current!.animating) return;

		if (!current!.expanded) {
			await runIn();
		} else {
			await runOut();
		}
	}

	async function runIn() {
		let current: OverlayState;
		subscribe((s) => (current = s))();
		// Guard re-entry
		if (current!.animating) return;

		// Start
		update((s) => ({ ...s, animating: true, direction: 'in', phase: 'collapsingBanner' }));
		try {
			await requestCollapseAndWait();
		} catch {
			/* empty */
		}

		// Fade out banners with stagger
		update((s) => ({ ...s, phase: 'fadingBannersOut' }));
		const { bannerCount, config, reducedMotion } = current!;
		if (!reducedMotion) {
			const total = Math.max(
				0,
				(bannerCount - 1) * config.staggerMs + config.fadeMs + config.bufferMs
			);
			await wait(total);
		}

		// Center Signature — wait for signal from component
		update((s) => ({ ...s, phase: 'centeringSignature' }));
		if (!reducedMotion) {
			const [p, r] = createCompleter();
			centerDoneResolve = r;
			await p;
		}

		// Scale Signature — wait for signal
		update((s) => ({ ...s, phase: 'scalingSignature' }));
		if (!reducedMotion) {
			const [p, r] = createCompleter();
			scaleUpDoneResolve = r;
			await p;
		}

		// Expanded idle state
		update((s) => ({
			...s,
			expanded: true,
			phase: 'expanded',
			direction: 'none',
			animating: false
		}));
	}

	async function runOut() {
		let current: OverlayState;
		subscribe((s) => (current = s))();
		if (current!.animating) return;

		update((s) => ({ ...s, animating: true, direction: 'out', phase: 'hidingSecondSpan' }));
		if (!current!.reducedMotion) {
			const [p, r] = createCompleter();
			secondSpanHiddenResolve = r;
			await p;
		}

		update((s) => ({ ...s, phase: 'scalingDown' }));
		if (!current!.reducedMotion) {
			const [p, r] = createCompleter();
			scaleDownDoneResolve = r;
			await p;
		}

		update((s) => ({ ...s, phase: 'movingBack' }));
		if (!current!.reducedMotion) {
			const [p, r] = createCompleter();
			moveBackDoneResolve = r;
			await p;
		}

		// Fade banners back in
		update((s) => ({ ...s, phase: 'fadingBannersIn' }));
		const { bannerCount, config, reducedMotion } = current!;
		if (!reducedMotion) {
			const total = Math.max(
				0,
				(bannerCount - 1) * config.staggerMs + config.fadeMs + config.bufferMs
			);
			await wait(total);
		}

		update((s) => ({ ...s, expanded: false, phase: 'idle', direction: 'none', animating: false }));
	}

	// Signals from Signature
	function centerDone() {
		centerDoneResolve?.();
		centerDoneResolve = null;
	}
	function scaleUpDone() {
		scaleUpDoneResolve?.();
		scaleUpDoneResolve = null;
	}
	function secondSpanHiddenDone() {
		secondSpanHiddenResolve?.();
		secondSpanHiddenResolve = null;
	}
	function scaleDownDone() {
		scaleDownDoneResolve?.();
		scaleDownDoneResolve = null;
	}
	function moveBackDone() {
		moveBackDoneResolve?.();
		moveBackDoneResolve = null;
	}

	// Helper to read current value synchronously for components
	function get(): OverlayState {
		let v!: OverlayState;
		subscribe((s) => (v = s))();
		return v;
	}

	return {
		subscribe,
		setBannerCount,
		setReducedMotion,
		toggle,
		centerDone,
		scaleUpDone,
		secondSpanHiddenDone,
		scaleDownDone,
		moveBackDone,
		get
	};
}

export const profileOverlay: Readable<OverlayState> & {
	setBannerCount: (n: number) => void;
	setReducedMotion: (v: boolean) => void;
	toggle: () => Promise<void>;
	centerDone: () => void;
	scaleUpDone: () => void;
	secondSpanHiddenDone: () => void;
	scaleDownDone: () => void;
	moveBackDone: () => void;
	get: () => OverlayState;
} = createProfileOverlay();
