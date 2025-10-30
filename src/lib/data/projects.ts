export type ProjectData = Readonly<{
	id: string;
	title: string;
	dateSpan: string;
	image: string;
}>;

export const projects: readonly ProjectData[] = [
	{
		id: 'aquasolace',
		title: 'Aquasolace',
		dateSpan: 'October 2023 - September 2024',
		image: '/src/lib/assets/banners/banner-aquasolace.avif'
	},
	{
		id: 'nerf-viewer',
		title: 'UE5 plugin: NerFs-Viewer',
		dateSpan: 'March 2025 - Avril 2025',
		image: '/src/lib/assets/banners/banner-aquasolace.avif'
	},
	{
		id: 'works-on-llms',
		title: 'Works on LLMs',
		dateSpan: 'October 2024 - February 2026',
		image: '/src/lib/assets/banners/banner-aquasolace.avif'
	}
] as const;
