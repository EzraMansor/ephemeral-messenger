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
const dotenv = require ('dotenv');
const jwt = require('jsonwebtoken');
const db = require('../db.js');
const { broadcastMessage } = require('../sockets/socket.js');
const router = express.Router();

router.post('/', (req, res) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({success: false, error: "No token provided"});

    const token = authHeader.replace("Bearer ", "").trim();
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const username = decoded.sub;
        const roomName = req.body.roomName;
        
        try {
            // no name provided
            if (roomName == '') throw new Error('Empty room name');
            // success
            const roomId = db.createRoom(roomName, username);
            res.status(200).json({success: true, roomname: roomName, roomId: roomId});
            db.addMessage(roomId, username, username + ' created ' + roomName, true);
            broadcastMessage(roomId, null, username + ' created ' + roomName, null, 2);
        } catch (e) {
            // none unique room name
            console.log(e);
            res.status(400).json({success: false, error: "Invalid room name"});
        }
    } catch (e) {
        //token error
        console.log(e);
        res.status(401).json({success: false, error: "Invalid or expired token"});
    }
});

module.exports = router;