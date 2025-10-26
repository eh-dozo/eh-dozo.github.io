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
		image: 'https://picsum.photos/seed/aquasolace/1600/900'
	},
	{
		id: 'nerf-viewer',
		title: 'UE5 plugin: NerF-Viewer',
		dateSpan: 'March 2025 - Avril 2025',
		image: 'https://picsum.photos/seed/nerfviewer/1600/900'
	},
	{
		id: 'works-on-llms',
		title: 'Works on LLMs',
		dateSpan: 'October 2024 - February 2026',
		image: 'https://picsum.photos/seed/llms/1600/900'
	}
] as const;
