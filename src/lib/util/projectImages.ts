import { writable } from 'svelte/store';
import type { MediaItem } from '$lib/data/projectDetails';

const allBannerImageImports = import.meta.glob(
	'/src/lib/assets/banners/**/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}',
	{
		eager: true,
		import: 'default',
		query: { enhanced: true }
	}
);

const allProjectImageImports = import.meta.glob(
	'/src/lib/assets/projects/**/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}',
	{
		import: 'default',
		query: { enhanced: true }
	}
);

const allProjectVideoImports = import.meta.glob('/src/lib/assets/projects/**/*.{mp4,webm,ogg}', {
	import: 'default'
});

const bannerImageByBasename = new Map<string, string>();
for (const [path, mod] of Object.entries(allBannerImageImports)) {
	const base = path.split('/').pop();
	if (base) bannerImageByBasename.set(base, mod as string);
}

export type ProjectGalleryGroups = Record<number, string[]>;
export type ProjectMediaGroups = Record<number, MediaItem[]>;

export type ProjectImageStatus = {
	loading: boolean;
	loaded: boolean;
	error?: string;
};

const imageCache = new Map<string, ProjectGalleryGroups>();
const mediaCache = new Map<string, ProjectMediaGroups>();
const inFlight = new Map<string, Promise<ProjectGalleryGroups>>();
const mediaInFlight = new Map<string, Promise<ProjectMediaGroups>>();

export const projectImagesStatus = writable<Record<string, ProjectImageStatus>>({});

function updateStatus(projectId: string, patch: Partial<ProjectImageStatus>) {
	projectImagesStatus.update((s) => {
		const prev = s[projectId] ?? { loading: false, loaded: false };
		return { ...s, [projectId]: { ...prev, ...patch } }; // shallow merge the previous state with the new one
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

export function getEnhancedImageByPathOrName(input: string | undefined): string | string {
	if (!input) return '';
	const base = input.split('/').pop()!;
	return bannerImageByBasename.get(base) as string | string;
}

function getMediaType(path: string): 'image' | 'video' {
	const ext = path.split('.').pop()?.toLowerCase();
	if (ext && ['mp4', 'webm', 'ogg'].includes(ext)) {
		return 'video';
	}
	return 'image';
}

export function isProjectMediaLoaded(projectId: string): boolean {
	return mediaCache.has(projectId);
}

export function getProjectMedia(projectId: string): ProjectMediaGroups | undefined {
	return mediaCache.get(projectId);
}

export function getGalleryMedia(projectId: string, galleryIndex: number): MediaItem[] | undefined {
	return mediaCache.get(projectId)?.[galleryIndex];
}

export async function ensureProjectMediaLoaded(projectId: string): Promise<ProjectMediaGroups> {
	if (mediaCache.has(projectId)) {
		return mediaCache.get(projectId)!;
	}
	if (mediaInFlight.has(projectId)) {
		return mediaInFlight.get(projectId)!;
	}

	updateStatus(projectId, { loading: true, loaded: false, error: undefined });

	const promise = (async () => {
		try {
			const pathPrefix = `/src/lib/assets/projects/${projectId}/`;

			const allMediaImports = { ...allProjectImageImports, ...allProjectVideoImports };
			const matchingPaths = Object.keys(allMediaImports)
				.filter((key) => key.startsWith(pathPrefix))
				.sort();

			const groups = new Map<number, MediaItem[]>();

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

					const url = (await allMediaImports[path]()) as string;
					const mediaType = getMediaType(path);

					if (!groups.has(galleryIndex)) groups.set(galleryIndex, []);
					groups.get(galleryIndex)!.push({ type: mediaType, src: url });
				})
			);

			const result: ProjectMediaGroups = {};
			for (const [idx, list] of Array.from(groups.entries()).sort((a, b) => a[0] - b[0])) {
				result[idx] = list;
			}

			mediaCache.set(projectId, result);
			updateStatus(projectId, { loading: false, loaded: true });
			mediaInFlight.delete(projectId);
			return result;
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : String(e);
			updateStatus(projectId, { loading: false, loaded: false, error: message });
			mediaInFlight.delete(projectId);
			throw e;
		}
	})();

	mediaInFlight.set(projectId, promise);
	return promise;
}
