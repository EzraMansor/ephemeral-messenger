/*
 * session-messenger-poc - An ephemeral, session-based, real-time messaging web application.
 * Copyright (C) 2026 Ezra Mansor <your.email@example.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const wss = require('./sockets/socket.js');
const app = express();
const port = 3000;
const server = http.createServer(app);

dotenv.config();

server.listen(process.env.PORT, () => {});

app.use(express.json());
app.use(express.static('public'));

app.use('/login', require('./routes/login.js'));

app.use('/addroom', require('./routes/addroom.js'));

app.use('/joinuser', require('./routes/joinuser.js'));

app.use('/getusers', require('./routes/getusers.js'));

app.use('/sendmessage', require('./routes/sendmessage.js'));

app.use('/getmessages', require('./routes/getmessages.js'));

app.use('/leaveroom', require('./routes/leaveroom.js'));

wss.listenWS(server);

