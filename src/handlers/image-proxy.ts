import * as sharp from 'sharp';
import * as request from 'request';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';

export const handleImage = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { url = null, format = null } = req.query;

	if (url === null || format !== 'round') {
		return res.sendStatus(400);
	}

	request(
		url,
		{
			timeout: 5000, // 5 seconds
			headers: { Accept: 'image/*' },
			encoding: null
		},
		(err, response, body) => {
			if (err) return next(err);
			else if (response.statusCode !== 200)
				return res.sendStatus(response.statusCode);

			const roundedCorners = Buffer.from(
				'<svg><rect x="0" y="0" width="256" height="256" rx="256" ry="256"/></svg>'
			);

			sharp(body)
				.resize(256, 256)
				.composite([
					{
						input: roundedCorners,
						blend: 'dest-in'
					}
				])
				.png()
				.toBuffer()
				.then(data => {
					res.setHeader('Content-Type', 'image/png');
					return res.send(data);
				})
				.catch(_ => {
					return res.sendStatus(500);
				});
		}
	);
};
