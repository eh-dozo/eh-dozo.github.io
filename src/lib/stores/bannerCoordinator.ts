export type CollapseFn = () => Promise<void> | void;

let expandedId: string | null = null;
const registrations = new Map<string, CollapseFn>();

let waitingForId: string | null = null;
let waitingResolve: (() => void) | null = null;

export function registerBanner(id: string, collapse: CollapseFn) {
	registrations.set(id, collapse);
}

function reset(id: string) {
	if (expandedId === id) expandedId = null;
	if (waitingForId === id) {
		waitingResolve?.();
		waitingResolve = null;
		waitingForId = null;
	}
}

export function unregisterBanner(id: string) {
	registrations.delete(id);
	reset(id);
}

export function notifyExpanded(id: string) {
	expandedId = id;
}

export function notifyCollapsed(id: string) {
	reset(id);
}

export async function requestCollapseAndWait(exceptId?: string): Promise<void> {
	if (!expandedId || (exceptId && expandedId === exceptId)) return;
	const current = expandedId;
	const collapse = current ? registrations.get(current) : undefined;
	if (!collapse) return;

	const done = new Promise<void>((resolve) => {
		waitingForId = current;
		waitingResolve = resolve;
	});

	try {
		await collapse();
	} catch {
		/* empty */
	}

	await done;
}
