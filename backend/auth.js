const jwt = require('jsonwebtoken');

module.exports.createAccessToken = (user) => {
	let accessToken = jwt.sign({
		id: user._id,
		username: user.username,
		recordType: user.recordType
	}, process.env.SECRET);

	return accessToken;
}

module.exports.verify = (request, response, next) => { 
	let token = request.headers.authorization;
	if( typeof token !== 'undefined'){
		token = token.slice( 7, token.length)

		jwt.verify(token, process.env.SECRET, (err, decoded) => {
			if (!err) request.decodedToken = decoded;
			return err ? response.send({auth:failed}) : next();
		})
	}else {
		return response.send({ auth: 'failed.'})
	}
}