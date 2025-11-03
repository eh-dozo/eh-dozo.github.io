export type MediaItem = Readonly<{
	type: 'image' | 'video';
	src: string;
}>;

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
		media: readonly MediaItem[];
	}>[];
}>;

export const projectDetails: Record<string, ProjectDetails> = {
	'nerf-viewer': {
		id: 'ue-plugin-nerf',
		arrangement: 'paragraph-first',
		paragraphs: [
			{
				text: 'Personal project',
				textJustify: 'left'
			},
			{
				text: "Allows for Neural Radiance Field (NeRF) reconstructions inside Unreal Engine 5' Niagara particle system. Pointcloud data exported from tools likes Nerfstudio can be sampled with a custom Niagara Data Interface (NDI).",
				textJustify: 'left'
			},
			{
				text: 'This project led to a few collaborations with SP99, a Berlin-based collective:',
				textJustify: 'left'
			}
		],
		galleries: [
			{
				maxRows: 1,
				maxCols: 1,
				media: [{ type: 'video', src: './src/lib/assets/projects/ue-plugin-nerf/01/durr-03.mp4' }]
			},
			{
				maxRows: 1,
				maxCols: 1,
				media: [{ type: 'video', src: './src/lib/assets/projects/ue-plugin-nerf/02/demo-02.mp4' }]
			},
			{
				maxRows: 1,
				maxCols: 2,
				media: [
					{ type: 'video', src: './src/lib/assets/projects/ue-plugin-nerf/03/sp99-03.mp4' },
					{ type: 'video', src: './src/lib/assets/projects/ue-plugin-nerf/03/sp99-02.mp4' }
				]
			}
		]
	},
	'works-on-llms': {
		id: 'llm-works',
		arrangement: 'paragraph-first',
		paragraphs: [
			{
				text: 'LlamaRunner is an Unreal Engine 5 plugin that was developed during my second Independent Coursework at the HTW - Berlin.\nThe plugin integrates the llama.cpp library inside the game engine as a custom, configurable subsystem. It allows game developer to use local <i>(i.e. offline)</i> Large Language Models (LLMs) for game development and can be supported on some hardware & environments for packaging.'
			},
			{
				text: 'The video above displays a demo of a game-experiment made using the LlamaRunner plugin which serve as a case study for my current master thesis. The paper aims to provide a empirical study on the usage of LLMs, more specifically local LLMs, as game design framework.'
			},
			{
				text: '<i>Note: on a personal perspective, the goal of these projects is not to provide tools that should, in any way, replace existing jobs. Instead, they should provide an extension to our existing workflows.<i/>'
			}
		],
		galleries: [
			{
				maxRows: 1,
				maxCols: 1,
				media: [
					{ type: 'video', src: './src/lib/assets/projects/llm-works/01/masterarbeit-demo.mp4' }
				]
			}
		]
	},
	aquasolace: {
		id: 'aquasolace',
		arrangement: 'paragraph-first',
		paragraphs: [
			{
				text: 'Environmental simulation / puzzle game\nTwo-semester academic group project in collaboration with NABU (Naturschutzbund Deutschland) Brandenburg\nContributions: Game Design, Game Code Implementation, 3D Models Animations',
				textJustify: 'left'
			},
			{
				text: 'Following the IMI Showtime Summer 2024 presentation, I continued as a solo freelance developer to complete and deliver the final game to the NABU.',
				textJustify: 'left'
			}
		],
		galleries: [
			{
				maxRows: 1,
				maxCols: 1,
				media: [
					{ type: 'video', src: './src/lib/assets/projects/aquasolace/aquasolace-game-01.mp4' }
				]
			},
			{
				maxRows: 1,
				maxCols: 1,
				media: [
					{ type: 'video', src: './src/lib/assets/projects/aquasolace/aquasolace-game-03.mp4' }
				]
			},
			{
				maxRows: 1,
				maxCols: 1,
				media: [
					{
						type: 'image',
						src: './src/lib/assets/projects/aquasolace/aquasolace-outdoor-group-p.avif'
					}
				]
			}
		]
	}
};
