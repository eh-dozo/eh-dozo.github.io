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

/**
 * inspired from https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Sequencing_animations
 */
export interface AnimationCallbacks {
	// Signature animations
	centerSignature?: () => Animation | null;
	scaleUpSignature?: () => Animation | null;
	scaleDownSignature?: () => Animation | null;
	moveBackSignature?: () => Animation | null;
	// Secondary span fade
	fadeOutSecondSpan?: () => Animation | null;
	// Banner fade animations
	fadeBannersOut?: () => Animation[] | null;
	fadeBannersIn?: () => Animation[] | null;
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

	const callbacks: AnimationCallbacks = {};

	function setBannerCount(count: number) {
		update((s) => ({ ...s, bannerCount: count }));
	}

	function setReducedMotion(value: boolean) {
		update((s) => ({ ...s, reducedMotion: value }));
	}

	function registerCallbacks(cbs: Partial<AnimationCallbacks>) {
		Object.assign(callbacks, cbs);
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

	// Toggle-IN animation
	async function runIn() {
		let current: OverlayState;
		subscribe((s) => (current = s))();

		if (current!.animating) return;

		update((s) => ({ ...s, animating: true, direction: 'in', phase: 'collapsingBanner' }));
		try {
			await requestCollapseAndWait();
		} catch {
			/* empty */
		}

		update((s) => ({ ...s, phase: 'fadingBannersOut' }));
		if (!current!.reducedMotion && callbacks.fadeBannersOut) {
			const animations = callbacks.fadeBannersOut();
			if (animations && animations.length > 0) {
				const lastAnimation = animations[animations.length - 1];
				if (lastAnimation) {
					await lastAnimation.finished;
				}
			}
		}

		update((s) => ({ ...s, phase: 'centeringSignature' }));
		if (!current!.reducedMotion && callbacks.centerSignature) {
			const anim = callbacks.centerSignature();
			if (anim) await anim.finished;
		}

		update((s) => ({ ...s, phase: 'scalingSignature' }));
		if (!current!.reducedMotion && callbacks.scaleUpSignature) {
			const anim = callbacks.scaleUpSignature();
			if (anim) await anim.finished;
		}

		update((s) => ({
			...s,
			expanded: true,
			phase: 'expanded',
			direction: 'none',
			animating: false
		}));
	}

	// Toggle-OUT animation
	async function runOut() {
		let current: OverlayState;
		subscribe((s) => (current = s))();
		if (current!.animating) return;

		update((s) => ({ ...s, animating: true, direction: 'out', phase: 'hidingSecondSpan' }));
		if (!current!.reducedMotion && callbacks.fadeOutSecondSpan) {
			const anim = callbacks.fadeOutSecondSpan();
			if (anim) await anim.finished;
		}

		update((s) => ({ ...s, phase: 'scalingDown' }));
		if (!current!.reducedMotion && callbacks.scaleDownSignature) {
			const anim = callbacks.scaleDownSignature();
			if (anim) await anim.finished;
		}

		update((s) => ({ ...s, phase: 'movingBack' }));
		if (!current!.reducedMotion && callbacks.moveBackSignature) {
			const anim = callbacks.moveBackSignature();
			if (anim) await anim.finished;
		}

		update((s) => ({ ...s, phase: 'fadingBannersIn' }));
		if (!current!.reducedMotion && callbacks.fadeBannersIn) {
			const animations = callbacks.fadeBannersIn();
			if (animations && animations.length > 0) {
				const lastAnimation = animations[animations.length - 1];
				if (lastAnimation) {
					await lastAnimation.finished;
				}
			}
		}

		update((s) => ({ ...s, expanded: false, phase: 'idle', direction: 'none', animating: false }));
	}

	function get(): OverlayState {
		let v!: OverlayState;
		subscribe((s) => (v = s))();
		return v;
	}

	return {
		subscribe,
		setBannerCount,
		setReducedMotion,
		registerCallbacks,
		toggle,
		get
	};
}

export const profileOverlay: Readable<OverlayState> & {
	setBannerCount: (n: number) => void;
	setReducedMotion: (v: boolean) => void;
	registerCallbacks: (cbs: Partial<AnimationCallbacks>) => void;
	toggle: () => Promise<void>;
	get: () => OverlayState;
} = createProfileOverlay();
