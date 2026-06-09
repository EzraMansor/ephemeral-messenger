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

import { initializeEventListeners } from "./events.js";
import { connectWS } from "./socket.js";
import { verifyToken } from "./auth.js";
import { startTimer, pageInit } from "./ui.js";

document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username');
    
    if (!token) {
        window.location.replace('/');
        return;
    }

    // 1. Core security authorization lifecycle execution
    verifyToken(token);
    const expiryTime = JSON.parse(atob(token.split('.')[1])).exp - parseInt(Date.now() / 1000);
    startTimer(expiryTime);
    setTimeout(() => {
        window.location.replace('/');
    }, expiryTime * 1000);

    // 2. Attach standard input event mechanisms
    initializeEventListeners();

    // 3. Mount raw real-time networking connection cleanly
    const { addroom } = pageInit(username);
    connectWS('ws://127.0.0.1:8080/', token, addroom);
});