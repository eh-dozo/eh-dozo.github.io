export type ProjectDetails = Readonly<{
	id: string;
	arrangement?: 'paragraph-first' | 'gallery-first';
	paragraphs?: Readonly<
		{
			title?: string;
			text: string;
			textJustify?: string;
		}[]
	>;
	galleries?: Readonly<{
		maxRows: number;
		maxCols: number;
		images: readonly string[];
	}>[];
}>;

export const projectDetails: Record<string, ProjectDetails> = {
	aquasolace: {
		id: 'aquasolace',
		arrangement: 'paragraph-first',
		paragraphs: [
			{
				title: 'Aquasolace',
				text: 'A two-semester academic collaboration with NABU (Naturschutzbund Deutschland) Brandenburg, where I developed a environmental simulation / puzzle game.',
				textJustify: 'right'
			},
			{
				text: 'Following the IMI Showtime Summer 2024 presentation, I continued as a solo freelance developer to complete and deliver the final game to the organization.',
				textJustify: 'left'
			}
		],
		galleries: [
			{
				maxRows: 1,
				maxCols: 1,
				images: ['./src/lib/assets/projects/aquasolace/aquasolace-game-sc-01.avif?enhanced']
			},
			{
				maxRows: 2,
				maxCols: 2,
				images: [
					'./src/lib/assets/projects/aquasolace/aquasolace-game-sc-02.avif?enhanced',
					'./src/lib/assets/projects/aquasolace/aquasolace-outdoor-group-p.avif?enhanced',
					'./src/lib/assets/projects/aquasolace/aquasolace-showtime-p.avif?enhanced'
				]
			}
		]
	},
	'nerf-viewer': {
		id: 'ue-plugin-nerf',
		arrangement: 'gallery-first',
		paragraphs: [
			{
				title: 'UE5 plugin: NerFs-Viewer',
				text: 'Placeholder paragraph for NerFs-Viewer.',
				textJustify: 'right'
			}
		],
		galleries: [
			{
				maxRows: 1,
				maxCols: 3,
				images: [
					'/banners/pointclouds.jpeg',
					'/banners/pointclouds.jpeg',
					'/banners/pointclouds.jpeg'
				]
			}
		]
	},
	'works-on-llms': {
		id: 'llm-works',
		arrangement: 'paragraph-first',
		paragraphs: [
			{
				title: 'Works on LLMs',
				text: 'Placeholder paragraph for Works on LLMs.'
			}
		],
		galleries: [
			{
				maxRows: 1,
				maxCols: 2,
				images: ['/banners/pointclouds.jpeg', '/banners/pointclouds.jpeg']
			}
		]
	}
};
