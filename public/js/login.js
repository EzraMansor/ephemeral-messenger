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

// clears any data left from the previous session to start a fresh session
sessionStorage.clear();

// caching ui elements
const button = document.querySelector('button');
const input = document.querySelector('input');
const err = document.getElementById('errorMessage');

input.focus();

button.addEventListener('click', async () => {
    login();
})

input.addEventListener('keydown', async (e) => {
    if (e.key == 'Enter') {
        login();
    }
})

async function login() {
    let username = input.value.trim().replace(' ', '');

    const response = await fetch("/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username: username})
    })

    if (response.ok) {
        data = await response.json();
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('username', data.username);
        window.location.replace('/chat.html');
    } else {
        const msg = await response.json();
        err.innerText = msg.error;
    }
}