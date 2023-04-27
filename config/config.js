exports.Sendgrid = process.env.SENDGRID_KEY;

exports.mongo = process.env.MONGO_DATABASE;

exports.accessToken = process.env.ACCESS_TOKEN_SECRET;
exports.refereshToken = process.env.REFRESH_TOKEN_SECRET;

exports.accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
exports.refereshTokenLife = process.env.REFRESH_TOKEN_LIFE;

exports.redisHost = process.env.REDIS_HOST;
exports.redisPassword = process.env.REDIS_PASSWORD;
exports.redisPort = process.env.REDIS_PORT

exports.googleAuth = process.env.OAuth2Client;

exports.stripePayment = process.env.STRIPE_SECRET_TOKEN;
