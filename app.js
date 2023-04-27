import path from 'path';
import http from 'http';
import redis from 'redis';
import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import socketio from 'socket.io';

import api_key from './config/config';
import authRoutes from './routes/auth';
import teacherRoutes from './routes/teacher';
import homeRoutes from './routes/homepage';
import courseRoutes from './routes/coursepage';
import stripeRoute from './routes/stripe';

const { mongo, redisHost, redisPort, redisPassword } = api_key;

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const client = redis.createClient({
    host: redisHost,
    port: redisPort,
    password: redisPassword
});

io.on('connect', async (socket) => {
    try {
        const { UserName, room, userId } = socket.handshake.query;
        console.log(UserName, room, userId);
        let newUser = false;
        let users = { id: [], names: [] };

        if (await client.existsAsync(room)) {
            const result = await client.lrangeAsync(room, 0, -1);
            console.log("lrange result join=", result);
            const History = [];

            result.forEach(user => {
                user = JSON.parse(user);
                History.push(user);

                if (!users.id.includes(user.userId)) {
                    users.id.push(user.userId);
                    users.names.push(user.UserName);
                    console.log("user added to list");
                }
            });

            console.log(users);

            if (!users.id.includes(userId)) {
                newUser = true;
                console.log("userUser");
                users.id.push(userId);
                users.names.push(UserName);
            }

            socket.emit('history', { History, users: users.names });
            socket.join(room);
            io.to(room).emit('admin', {
                users: users.names,
                UserName: 'admin',
                newUser,
                Message: newUser ? `Welcome to the class ${UserName}!` : `Welcome back to the class ${UserName}!`
            });

            socket.broadcast.to(room).emit('admin', {
                users: users,
                UserName: `${UserName}`,
                users: users.names,
                newUser,
                Message: `${UserName} has joined!`
            });

            newUser = false;
        } else {
            await client.hsetAsync(room, null);
            console.log("setting redis hset::", result);
        }
    } catch (err) {
        console.error(err);
    }
});

io.on('sendMessage', async ({ UserName, userId, room, message }, callback) => {
    try {
        const user = { UserName, Message: message, userId };

        if (await client.existsAsync(room)) {
            await client.rpushAsync(room, JSON.stringify(user));
            console.log("rpush::", result);
        } else {
            await client.hsetAsync(room, JSON.stringify(user));
            console.log("hset::", result);
        }

        const result = await client.lrangeAsync(room, 0, -1);
        console.log("redis result=", result);

        console.log(`${room} message sent by ${UserName} is::`, message);
        io.to(room).emit('Received_message', { UserName, Message: message });
        callback();
    } catch (err) {
        console.error(err);
    }
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/Files', express.static(path.join(__dirname, 'Files')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.use(authRoutes);
app.use(teacherRoutes);
app.use(homeRoutes);
app.use(courseRoutes);
app.use(stripeRoute);

(async () => {
    try {
        await mongoose.connect(mongo, { useUnifiedTopology: true, useNewUrlParser: true });
        server.listen(8080);
        console.log("Server Started!");
    } catch (err) {
        console.error(err);
    }
})();

module.exports = app;