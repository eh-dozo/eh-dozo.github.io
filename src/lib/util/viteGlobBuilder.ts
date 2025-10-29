export interface ImageModule {
	default: string;
}

const allProjectImageImports = import.meta.glob(
	'/src/lib/assets/projects/**/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}',
	{
		import: 'default',
		query: { enhanced: true }
	}
);

const imageCache = new Map<string, Record<string, string>>();

export async function getGlobForProjectAtIndex(
	projectId: string,
	galleryIndex: number
): Promise<Record<string, string>> {
	const cacheKey = `${projectId}-${galleryIndex}`;
	if (imageCache.has(cacheKey)) {
		return imageCache.get(cacheKey)!;
	}

	const pathPattern = `/src/lib/assets/projects/${projectId}/${String(galleryIndex + 1).padStart(2, '0')}/`;

	const matchingPaths = Object.keys(allProjectImageImports).filter((key) =>
		key.startsWith(pathPattern)
	);

	const results: Record<string, string> = {};
	await Promise.all(
		matchingPaths.map(async (path) => {
			results[path] = (await allProjectImageImports[path]()) as string;
		})
	);

	imageCache.set(cacheKey, results);

	return results;
}
