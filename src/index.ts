import * as express from 'express';
import * as handlers from './handlers';
import config from './config/server';

const { host, port } = config;
const app = express();

app.use((_, res, next) => {
	res.setHeader('X-Powered-By', 'Alexis Bize');
	return next();
});

app.get('/', handlers.imageProxy.handleImage);

app.listen(port, host, err => {
	if (err) throw err;
	else console.info(`> Listening at http://${host}:${port}`);
});
