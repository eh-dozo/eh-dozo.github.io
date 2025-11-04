export type ProjectData = Readonly<{
	id: string;
	title: string;
	dateSpan: string;
	image: string;
	titleColor?: string;
	dateColor?: string;
	titleBadge?: string;
}>;

export const projects: readonly ProjectData[] = [
	{
		id: 'nerf-viewer',
		title: 'UE5 plugin: NerFs-Viewer',
		dateSpan: 'March 2025 - Avril 2025',
		image: '/src/lib/assets/banners/banner-nerf.avif'
	},
	{
		id: 'works-on-llms',
		title: 'Works on<br />LLMs',
		dateSpan: 'October 2024 - February 2026',
		image: '/src/lib/assets/banners/banner-llm.avif',
		dateColor: 'text-lime-900',
		titleBadge: 'WIP'
	},
	{
		id: 'aquasolace',
		title: 'Aquasolace',
		dateSpan: 'October 2023 - September 2024',
		image: '/src/lib/assets/banners/banner-aquasolace.avif',
		titleColor: 'text-rose-100',
		dateColor: 'text-rose-300'
	}
] as const;
