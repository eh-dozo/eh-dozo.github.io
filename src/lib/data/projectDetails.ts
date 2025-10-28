export type ProjectDetails = Readonly<{
	arrangement?: 'paragraph-first' | 'gallery-first';
	paragraph?: Readonly<{
		title?: string;
		text: string;
	}>;
	gallery?: Readonly<{
		rows: number;
		cols: number;
		images: readonly string[];
	}>;
}>;

export const projectDetails: Record<string, ProjectDetails> = {
	aquasolace: {
		arrangement: 'paragraph-first',
		paragraph: {
			title: 'Aquasolace',
			text: 'Placeholder paragraph for Aquasolace.'
		},
		gallery: {
			rows: 2,
			cols: 2,
			images: [
				'/banners/aquasolace.jpeg',
				'/banners/pointclouds.jpeg',
				'/banners/pointclouds.jpeg',
				'/banners/pointclouds.jpeg'
			]
		}
	},
	'nerf-viewer': {
		arrangement: 'gallery-first',
		paragraph: {
			title: 'UE5 plugin: NerFs-Viewer',
			text: 'Placeholder paragraph for NerFs-Viewer.'
		},
		gallery: {
			rows: 1,
			cols: 3,
			images: [
				'/banners/pointclouds.jpeg',
				'/banners/pointclouds.jpeg',
				'/banners/pointclouds.jpeg'
			]
		}
	},
	'works-on-llms': {
		arrangement: 'paragraph-first',
		paragraph: {
			title: 'Works on LLMs',
			text: 'Placeholder paragraph for Works on LLMs.'
		},
		gallery: {
			rows: 1,
			cols: 2,
			images: ['/banners/pointclouds.jpeg', '/banners/pointclouds.jpeg']
		}
	}
};
