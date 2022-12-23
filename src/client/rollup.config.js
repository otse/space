const production = !process.env.ROLLUP_WATCH;

export default {
	input: '../../js/space.js',
	output: {
		name: 'space',
		file: '../../bin/server/bundle.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: false,
		globals: { THREEX: 'THREEX' }
	}
};