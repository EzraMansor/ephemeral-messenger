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

const token = sessionStorage.getItem('token');

export function verifyToken(token) {
  // no token means not signed in so redirect to login.js
  if (!token || isTokenExpired(token)) {
      window.location.replace('/');
}}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // extract the expiry date
    return Date.now() / 1000 > payload.exp; // token expired
  } catch (e) { // token missing or invalid
    return true;
  }
}