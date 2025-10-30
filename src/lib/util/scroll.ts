export function easeInOutCubic(t: number) {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ---- for the scrollable content inside expanded ProjectBanner

export async function animateScrollToTop(el: HTMLElement, duration = 300): Promise<void> {
	const start = el.scrollTop;
	if (start <= 0) return;
	const startTime = performance.now();
	return new Promise((resolve) => {
		function step(now: number) {
			const p = Math.min(1, (now - startTime) / duration);
			const eased = easeInOutCubic(p);
			el.scrollTop = start * (1 - eased);
			if (p < 1) requestAnimationFrame(step);
			else resolve();
		}
		requestAnimationFrame(step);
	});
}

export function getMainScroller(): HTMLElement | null {
	return (document.querySelector('[data-main-scroll]') as HTMLElement) ?? null;
}

function scrollToY(
	scroller: HTMLElement,
	to: number,
	duration = 500,
	easing: (t: number) => number = easeInOutCubic
): Promise<void> {
	const start = scroller.scrollTop;
	const max = scroller.scrollHeight - scroller.clientHeight;
	const target = Math.max(0, Math.min(max, to));
	const change = target - start;
	if (duration <= 0 || Math.abs(change) < 1) {
		scroller.scrollTop = target;
		return Promise.resolve();
	}
	const startTime = performance.now();
	return new Promise((resolve) => {
		function step(now: number) {
			const p = Math.min(1, (now - startTime) / duration);
			const eased = easing(p);
			scroller.scrollTop = start + change * eased;
			if (p < 1) requestAnimationFrame(step);
			else resolve();
		}
		requestAnimationFrame(step);
	});
}

function computeCenterTargetY(scroller: HTMLElement, el: HTMLElement) {
	const sRect = scroller.getBoundingClientRect();
	const eRect = el.getBoundingClientRect();
	const delta = eRect.top - sRect.top + eRect.height / 2 - scroller.clientHeight / 2;
	return scroller.scrollTop + delta;
}

async function withScrollSnapDisabled(scrollerElem: HTMLElement, fn: () => Promise<void>) {
	const prev = scrollerElem.style.scrollSnapType;
	scrollerElem.style.scrollSnapType = 'none';
	try {
		await fn();
	} finally {
		scrollerElem.style.scrollSnapType = prev;
	}
}

// ---- for the ProjectBanner click-then-scrollinto

export async function scrollElementToCenter(
	scroller: HTMLElement,
	targetEl: HTMLElement,
	duration = 500
): Promise<void> {
	const target = computeCenterTargetY(scroller, targetEl);
	await withScrollSnapDisabled(scroller, () => scrollToY(scroller, target, duration));
}
