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
const jwt = require('../jwtAuth.js');
const db = require('../db.js');
const { notifyAddedUser, broadcastMessage, broadcastAddedUser } = require('../sockets/socket.js');
const router = express.Router();

router.post('/', (req, res) => {
  const username = jwt.verifyJWT(req);
  if (username == 'No token provided' || username == 'Invalid or expired token') {
      return res.status(401).json({success: false, error: username});
  }
  const newUser = req.body.newUser;
  const roomId = req.body.roomId;
  const roomName = req.body.roomName;

  try {
    // success
    const added = db.joinUser(username, newUser, roomId);
    res.status(200).json({success: true});
  } catch (e) {
    console.log(e);
    return res.status(400).json({success: false, error: 'Cannot add user to room'});
  }
  notifyAddedUser(newUser, roomName, roomId);

  const global = newUser + ' joined the room';
  db.addMessage(roomId, username, global, true);
  broadcastMessage(roomId, null, global, null, 2);
  broadcastAddedUser(username, newUser, roomId);
})

module.exports = router;