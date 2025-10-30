import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: undefined,
			strict: true
		}),
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				if (path === '/not-found' && referrer === '/blog/how-we-built-our-404-page') {
					return;
				}

				throw new Error(message);
			}
		}
	}
};

export default config;
