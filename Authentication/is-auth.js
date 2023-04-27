import jwt from 'jsonwebtoken'
import api_key from '../config/config'

exports.authentication = async (req, res, next) => {
    try {
        let access_token = req.headers['authorization'];

        if (!access_token) {
            return res.status(401).json({ message: "No autenticado" });
        }

        let access = access_token.split(' ')[1];
        let payload;

        try {
            payload = jwt.verify(access, api_key.accessToken);
        } catch (err) {
            throw new Error("No autenticado");
        }

        if (!payload) {
            throw new Error("No autenticado");
        }

        res.userID = payload['username'];
        next();
    } catch (err) {
        return res.status(401).json({ message: err.message });
    }
};

exports.GetnewAccessToken = async (req, res) => {
    try {
        let refresh_token = req.body.refresh_token;

        if (!refresh_token) {
            throw new Error("No autenticado");
        } else {
            jwt.verify(refresh_token, api_key.refereshToken, async function (err, decoded) {
                if (err) {
                    throw new Error("No autenticado");
                } else {
                    const access_token = jwt.sign({ email: decoded['email'] }, api_key.accessToken, {
                        algorithm: "HS256",
                        expiresIn: api_key.accessTokenLife
                    });

                    const referesh_token = jwt.sign({ email: decoded['email'] }, api_key.refereshToken, {
                        algorithm: "HS256",
                        expiresIn: api_key.refereshTokenLife
                    });

                    return res.status(200).json({
                        message: "Token enviado de forma correcta",
                        access_token: access_token,
                        refresh_token: referesh_token
                    });
                }
            });
        }
    } catch (err) {
        return res.status(401).json({ message: err.message });
    }
};
