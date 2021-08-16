const _ = require('lodash');

const forge = require('node-forge');

const { pki } = forge;
// const { rsa } = forge.pki;

// Possible improvement is to add caching in order to parse key and
// derive public key only the first time or if required.

module.exports = () => {
	// Get public key from private key
	let privatePEMPassword;
	let privatePEM;
	let privateKey;
	let publicKey;
	let publicPEM;
	let certPrivate;
	let certPublic;
	try {
		// --------------------------------------------------------------------------------
		privatePEMPassword = _.get(process.env, 'JWT_PRIVATE_KEY_PASSWORD');
		privatePEM = Buffer.from(
			_.get(process.env, 'JWT_PRIVATE_KEY'),
			'base64'
		).toString();

		privateKey = pki.decryptRsaPrivateKey(privatePEM, privatePEMPassword);
		publicKey = pki.setRsaPublicKey(privateKey.n, privateKey.e);

		//publicPEM = _.get(process.env, 'JWT_PUBLIC_KEY', pki.publicKeyToPem(publicKey));
		publicPEM = pki.publicKeyToPem(publicKey);

		// Get priv and public key in format for JWT
		certPrivate = {
			key: privatePEM,
			passphrase: privatePEMPassword,
		};
		certPublic = publicPEM;
	} catch (error) {
		console.log(error);
		console.log(
			'Error while parsing JWT_PRIVATE_KEY, check JWT_PRIVATE_KEY_PASSWORD .'
		);
		console.log(Array(80 + 1).join('#'));
	}
	return {
		certPrivate,
		certPublic,
	};
};
