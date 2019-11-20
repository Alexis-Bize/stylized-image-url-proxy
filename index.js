/**
 * @param {Error} err
 * @returns {void}
 */
const _onError = err => {
	console.error(err); // eslint-disable-line
	process.exit(1);
};

process.on('unhandledRejection', _onError);
process.on('uncaughtException', _onError);

require('./dist');
