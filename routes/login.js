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
const router = express.Router();

router.post('/', (req, res) => {
  const response = generateTokenResponse(req.body.username);
  try {
    db.createUser(req.body.username);
    res.status(200).json(response);
    timer = setTimeout(() => {
      if (db.getIdFromUsername(req.body.username)) {
        db.removeUser(req.body.username);
      }
    }, 1000 * 60 * 60); // set a timer to automatically remove the user after one hour, assuming the user still exists
  } catch (e) {
    console.log(e);
    res.status(400).json({error: 'Username not available'});
  }
});

function generateTokenResponse(username) {
  let jwtsercretkey = process.env.JWT_SECRET_KEY;
  const exp = Math.floor(Date.now() / 1000) + (60 * 60); // set expiry for an hour

  let data = {
    sub: username,
    exp: exp
  }

  const token = jwt.sign(data, jwtsercretkey);

  const response = {
    username: username,
    token: token
  }

  return response;
}

module.exports = router;