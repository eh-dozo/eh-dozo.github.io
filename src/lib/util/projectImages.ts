import { writable } from 'svelte/store';

// Eager-import enhanced images anywhere under src/lib/assets/banners to resolve banner images synchronously for SSR
const allBannerImageImports = import.meta.glob(
	'/src/lib/assets/banners/**/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}',
	{
		eager: true,
		import: 'default',
		query: { enhanced: true }
	}
);

// All project image imports (lazy-load)
const allProjectImageImports = import.meta.glob(
	'/src/lib/assets/projects/**/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}',
	{
		import: 'default',
		query: { enhanced: true }
	}
);

// Build an index by basename (e.g. "aquasolace.jpeg" => enhanced meta)
const bannerImageByBasename = new Map<string, string>();
for (const [path, mod] of Object.entries(allBannerImageImports)) {
	const base = path.split('/').pop();
	if (base) bannerImageByBasename.set(base, mod as string);
}

export type ProjectGalleryGroups = Record<number, string[]>;

export type ProjectImageStatus = {
	loading: boolean;
	loaded: boolean;
	error?: string;
};

const imageCache = new Map<string, ProjectGalleryGroups>();
const inFlight = new Map<string, Promise<ProjectGalleryGroups>>();

export const projectImagesStatus = writable<Record<string, ProjectImageStatus>>({});

function updateStatus(projectId: string, patch: Partial<ProjectImageStatus>) {
	projectImagesStatus.update((s) => {
		const prev = s[projectId] ?? { loading: false, loaded: false };
		return { ...s, [projectId]: { ...prev, ...patch } }; // shallow the previous state with the new one
	});
}

export function isProjectLoaded(projectId: string): boolean {
	return imageCache.has(projectId);
}

export function getProjectImages(projectId: string): ProjectGalleryGroups | undefined {
	return imageCache.get(projectId);
}

export function getGalleryImages(projectId: string, galleryIndex: number): string[] | undefined {
	return imageCache.get(projectId)?.[galleryIndex];
}

export async function ensureProjectImagesLoaded(projectId: string): Promise<ProjectGalleryGroups> {
	if (imageCache.has(projectId)) {
		return imageCache.get(projectId)!;
	}
	if (inFlight.has(projectId)) {
		return inFlight.get(projectId)!;
	}

	updateStatus(projectId, { loading: true, loaded: false, error: undefined });

	const promise = (async () => {
		try {
			// build template literal and filter here because
			// import.meta.glob ONLY accept literals as parameters and we use dynamic paths
			const pathPrefix = `/src/lib/assets/projects/${projectId}/`;
			const matchingPaths = Object.keys(allProjectImageImports)
				.filter((key) => key.startsWith(pathPrefix))
				.sort();

			const groups = new Map<number, string[]>();

			await Promise.all(
				matchingPaths.map(async (path) => {
					const segments = path.split('/');
					const projIdx = segments.findIndex((s) => s === projectId);
					const folder = segments[projIdx + 1];
					let galleryIndex = Number.parseInt(folder, 10);
					if (!Number.isFinite(galleryIndex)) {
						galleryIndex = 1;
					}
					galleryIndex = Math.max(0, galleryIndex - 1);

					const url = (await allProjectImageImports[path]()) as string;
					if (!groups.has(galleryIndex)) groups.set(galleryIndex, []);
					groups.get(galleryIndex)!.push(url);
				})
			);

			const result: ProjectGalleryGroups = {};
			for (const [idx, list] of Array.from(groups.entries()).sort((a, b) => a[0] - b[0])) {
				result[idx] = list;
			}

			imageCache.set(projectId, result);
			updateStatus(projectId, { loading: false, loaded: true });
			inFlight.delete(projectId);
			return result;
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : String(e);
			updateStatus(projectId, { loading: false, loaded: false, error: message });
			inFlight.delete(projectId);
			throw e;
		}
	})();

	inFlight.set(projectId, promise);
	return promise;
}

// --- Banner helpers (sync for SSR) ---

/** Resolve an enhanced image meta object by a file path or basename. */
export function getEnhancedImageByPathOrName(input: string | undefined): string | string {
	if (!input) return '';
	const base = input.split('/').pop()!;
	return bannerImageByBasename.get(base) as string | string;
}
