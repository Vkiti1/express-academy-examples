const _ = require('lodash');
const {
	errorDescriptor,
	ERROR_INVALID_AUTHENTICATION_TOKEN,
	ERROR_INVALID_AUTHENTICATION_TOKEN_BAD_FORMAT,
	ERROR_INVALID_CORS_POLICY,
	ERROR_INTERNAL_SERVER_ERROR,
} = require('./../errors');
const jwtExpressFunction = require('express-jwt');

// const jwtExpress = jwtExpressFunction({
//   secret: jwtExpressSecret,
//   requestProperty: 'auth',
//   credentialsRequired: true,
// });

const customCORSAndAuthErrorMiddleware = (err, req, res, next) => {
	if (
		err.name === 'UnauthorizedError' &&
		_.get(err, 'code') === 'credentials_required'
	) {
		next(new Error(errorDescriptor(ERROR_INVALID_AUTHENTICATION_TOKEN)));
		return;
	}
	if (
		err.name === 'UnauthorizedError' &&
		_.get(err, 'code') === 'credentials_bad_format'
	) {
		next(
			new Error(errorDescriptor(ERROR_INVALID_AUTHENTICATION_TOKEN_BAD_FORMAT))
		);
		return;
	}
	if (
		err.name === 'UnauthorizedError' &&
		_.get(err, 'code') === 'invalid_token'
	) {
		// If there is invalid signature
		next(new Error(errorDescriptor(ERROR_INVALID_AUTHENTICATION_TOKEN)));
		return;
	}
	if (err.name === 'UnauthorizedError') {
		console.log(Array(80 + 1).join('-'));
		console.log(
			'There is UnauthorizedError from jwtExpress, that has no custom error message.'
		);
		console.log(JSON.stringify(err, null, 2)); // Log the error message
		next(new Error(errorDescriptor(ERROR_INVALID_AUTHENTICATION_TOKEN)));
		return;
	}
	if (err.name === 'NotAllowedByCORSPolicy') {
		next(new Error(errorDescriptor(ERROR_INVALID_CORS_POLICY)));
		return;
	}
	if (err.name === 'InternalServerError') {
		console.log(JSON.stringify(err, null, 2));
		next(new Error(errorDescriptor(ERROR_INTERNAL_SERVER_ERROR)));
		return;
	}
	next();
};

module.exports = {
	// jwtExpress,
	customCORSAndAuthErrorMiddleware,
};
