export type ProjectDetails = Readonly<{
	arrangement?: 'paragraph-first' | 'gallery-first';
	paragraphs?: Readonly<
		{
			title?: string;
			text: string;
			textJustify?: string;
		}[]
	>;
	gallery?: Readonly<{
		rows: number;
		cols: number;
		images: readonly string[];
	}>[];
}>;

export const projectDetails: Record<string, ProjectDetails> = {
	aquasolace: {
		arrangement: 'paragraph-first',
		paragraphs: [
			{
				title: 'Aquasolace',
				text: 'A two-semester academic collaboration with NABU (Naturschutzbund Deutschland) Brandenburg, where I developed a environmental simulation / puzzle game.',
				textJustify: 'right'
			},
			{
				text: 'Following the IMI Showtime Summer 2024 presentation, I continued as a freelance developer to complete and deliver the production-ready solution to the organization.',
				textJustify: 'left'
			}
		],
		gallery: [
			{
				rows: 2,
				cols: 2,
				images: [
					'/banners/aquasolace.jpeg',
					'/banners/pointclouds.jpeg',
					'/banners/pointclouds.jpeg',
					'/banners/pointclouds.jpeg'
				]
			}
		]
	},
	'nerf-viewer': {
		arrangement: 'gallery-first',
		paragraphs: [
			{
				title: 'UE5 plugin: NerFs-Viewer',
				text: 'Placeholder paragraph for NerFs-Viewer.',
				textJustify: 'right'
			}
		],
		gallery: [
			{
				rows: 1,
				cols: 3,
				images: [
					'/banners/pointclouds.jpeg',
					'/banners/pointclouds.jpeg',
					'/banners/pointclouds.jpeg'
				]
			}
		]
	},
	'works-on-llms': {
		arrangement: 'paragraph-first',
		paragraphs: [
			{
				title: 'Works on LLMs',
				text: 'Placeholder paragraph for Works on LLMs.'
			}
		],
		gallery: [
			{
				rows: 1,
				cols: 2,
				images: ['/banners/pointclouds.jpeg', '/banners/pointclouds.jpeg']
			}
		]
	}
};
