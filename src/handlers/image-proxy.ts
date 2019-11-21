import * as sharp from 'sharp';
import * as request from 'request';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';

// #region definitions

type Shape = 'circle' | 'heart' | 'star';

// #endregion
// #region definitions

const supportedShapes: Shape[] = ['circle', 'heart', 'star'];
const shapesMapping: { [K in Shape]: string } = {
	circle:
		'<svg>\
			<rect x="0" y="0" width="256" height="256" rx="256" ry="256" />\
		</svg>',
	heart:
		'<svg width="252" height="252" viewBox="0 0 32 29.6">\
			<path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2 c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z" />\
		</svg>',
	star:
		'<svg width="252" height="252" viewBox="0 0 198 182">\
			<polygon points="100,0,129.38926261462365,59.54915028125263,195.10565162951536,69.09830056250526,147.55282581475768,115.45084971874736,158.77852522924732,180.90169943749473,100,150,41.2214747707527,180.90169943749476,52.447174185242325,115.45084971874738,4.894348370484636,69.09830056250527,70.61073738537632,59.549150281252636"></polygon>\
		</svg>'
};

// #endregion
// #region public methods

export const handleImage = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const {
		url = null,
		shape = 'circle'
	}: {
		url: null | string;
		shape: Shape;
	} = req.query;

	if (url === null || !supportedShapes.includes(shape)) {
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

			const SVGShape = Buffer.from(shapesMapping[shape]);

			sharp(body)
				.resize(256, 256)
				.composite([
					{
						input: SVGShape,
						blend: 'dest-in'
					}
				])
				.png()
				.toBuffer()
				.then(data => {
					res.setHeader('Content-Type', 'image/png');
					res.setHeader(
						'Content-Disposition',
						`inline; filename="${shape}-${Math.round(
							Date.now() / 1000
						)}.png"`
					);
					return res.send(data);
				})
				.catch(err => {
					console.error(err);
					return res.sendStatus(500);
				});
		}
	);
};

// #endregion
