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

const jwt = require('jsonwebtoken');

function verifyJWT(req) {
    const authHeader = req.header('Authorization');
    if (!authHeader) return 'No token provided';
    
    const token = authHeader.replace('Bearer ', '').trim();
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const username = decoded.sub;
        return username;
    } catch (e) {
        console.log(e);
        return "Invalid or expired token";
    }
}

module.exports = {verifyJWT};