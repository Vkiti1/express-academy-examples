// Load environment variable from .env file if not supplied
const path = require('path');
require('dotenv').config({
	path:
		typeof process.env.DOTENV_PATH !== 'undefined'
			? path.resolve(process.cwd(), process.env.DOTENV_PATH)
			: path.resolve(process.cwd(), '.env'),
});

// --- Start ---
const pretty = require('../src/utils/pretty');
const _ = require('lodash');
const express = require('express');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const jwtExpress = require('express-jwt');
const loadPrivateKey = require('./utils/loadPrivateKey');
const {
	customCORSAndAuthErrorMiddleware,
} = require('./utils/customMiddleware');
const { ERROR_PAGE_NOT_FOUND, errorDescriptor } = require('./errors/index');

const { certPrivate, certPublic } = loadPrivateKey();

const app = express();

app.use(morgan('combined'));

app.get('/', (req, res) => {
	res.send('Home Page');
});

app.get('/users', (req, res) => {
	res.send('Users Page!');
});

// TODO
app.get(
	'/my-profile',
	jwtExpress({
		secret: certPublic,
		algorithms: ['RS256'],
		requestProperty: 'auth',
	}),
	customCORSAndAuthErrorMiddleware,
	(req, res, next) => {
		if (!req.auth) {
			return res.sendStatus(403);
		}
		next();
	},
	(req, res) => {
		const dummyProfile = {
			firstName: 'Viktor',
			lastName: 'Škifić',
			dob: new Date(1997, 1, 27),
		};

		res.send(dummyProfile);
	}
);

app.get('/public', (req, res) => {
	res.type('plain/text');
	res.send(certPublic);
});

app.get('/sign/:id', (req, res) => {
	const result = jwt.sign({ id: req.params.id }, certPrivate, {
		algorithm: 'RS256',
	});
	res.send(result);
});

// 404
app.use((req, res, next) => {
	next(new Error(errorDescriptor(ERROR_PAGE_NOT_FOUND)));
});

app.use((error, req, res, next) => {
	// Try to parse the error, if unable log it and set it to default one.
	let errorOut = {};
	let parsed = {};
	try {
		parsed = JSON.parse(error.message);
		errorOut = {
			...parsed,
		};
	} catch (e) {
		console.log(
			'[API - ERROR] Unknown error, unable to parse the error key, code and message:'
				.bgYellow.black
		);
		console.error(error);
		errorOut.code = 500;
		errorOut.key = 'INTERNAL_SERVER_ERROR';
		errorOut.message = error.message;
	}

	// Audit the API errors
	// Get IP
	const ip =
		_.get(req, 'headers.x-forwarded-for') ||
		_.get(req, 'connection.remoteAddress');

	// Send the response to the client
	res.setHeader('Content-Type', 'application/json');
	res.status(errorOut.code).send(
		pretty({
			error: 1,
			errors: [{ ...errorOut }],
			data: null,
		})
	);
});

const port = process.env.PORT;

app.listen(port, () => {
	console.log(`🚀  Server ready at ${port}`);
});
