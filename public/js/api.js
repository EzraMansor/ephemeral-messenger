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

export async function requestNewRoom(newRoomName, token) {
    // send request to backend to verify
    const response = await fetch('/addroom', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({roomName: newRoomName})
    });

    return response;
}

export async function requestNewUser(newUserName, roomId, roomName, token) {
    // send request to backend to verify
    const response = await fetch('/joinuser', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({newUser: newUserName, roomId: roomId, roomName: roomName})
    });

    return response;
}

export async function getUsers(roomId, token) {
    const response = await fetch(`/getusers/${roomId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
    });

    return response;
}

export async function sendMessage(token, roomId, text) {
    const response = await fetch('/sendmessage', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({roomId: roomId, text: text})
    });
    
    return response;
}

export async function getMessages(roomId, token) {
    const response = await fetch(`/getmessages/${roomId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    });

    return response;
}

export async function leaveRoom(roomId, token) {
    const response = await fetch(`/leaveroom/${roomId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    })

    return response;
}