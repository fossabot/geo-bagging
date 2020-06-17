module.exports = function (config) {
	config.set({
		frameworks: ['mocha'],

		files: [
			'dist/test.js'
		],

		browsers: ['Chrome_fixedSize'],

		customLaunchers: {
			'Chrome_fixedSize': {
				base: 'ChromeHeadless',
				flags: ['--window-size=1152,864']
			}
		}
	});
};
