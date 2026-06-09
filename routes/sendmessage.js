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
const jwt = require('../jwtAuth.js');
const {addMessage} = require('../db.js');
const { broadcastMessage } = require('../sockets/socket.js');
const router = express.Router();

router.post('/', (req, res) => {
    const username = jwt.verifyJWT(req);
    if (username == 'No token provided' || username == 'Invalid or expired token') {
        return res.status(401).json({success: false, error: username});
    }
    const roomId = req.body.roomId;
    const text = req.body.text;

    try {
        addMessage(roomId, username, text, false);
        res.status(200).json({success: true});
    } catch (e) {
        console.log(e);
        return res.status(400).json({success: false, error: 'Cannot send message'});
    }
    broadcastMessage(roomId, username, text, null, 1);
})

module.exports = router;