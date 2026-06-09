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

import { getMessages, getUsers, leaveRoom, requestNewRoom, requestNewUser, sendMessage } from "./api.js";
import { connectWS, setTypingStatus } from "./socket.js";
import { addMessage, addNewRoom, addNewRoomInput, addNewUser, addNewUserInput, clearMsgBar, confirmLeave, displayMessages, displayUsers, getCurrentRoom, getMessage, getNewRoomName, getNewUserName, pageInit, removeError, removeRoom, showError, startTimer, updateRoomTitle } from "./ui.js";
import { verifyToken } from "./auth.js";

const username = sessionStorage.getItem('username');
const token = sessionStorage.getItem('token');

let rooms = sessionStorage.getItem('rooms') ? sessionStorage.getItem('rooms').split(',') : [];
let currentRoom = 0;

const { addroom, adduser, sendMsg, messageBar } = pageInit(username);

export function initializeEventListeners() {
    if (rooms.length > 0 && rooms[currentRoom]) {
        const room = rooms[currentRoom].split('.');
        updateUi(room);
    }
    
    setupDelegatedRoomListeners();
    
    const addRoomHandler = () => {
        const newRoomDiv = addNewRoomInput();
        const newRoomHandler = async (event) => {
            switch (event.key) {
                case 'Enter':
                    const newRoomName = getNewRoomName();
                    const response = await requestNewRoom(newRoomName, token);
                    const msg = await response.json();
                
                    if (response.ok) {
                        rooms.push(msg.roomId + '.' + newRoomName);
                        sessionStorage.setItem('rooms', rooms.join(','));
                        addNewRoom(true, newRoomName); 
                        
                        currentRoom = rooms.length - 1;
                        updateUi([msg.roomId, newRoomName]);
                        return;
                    } else {
                        if (msg.error === "Invalid or expired token") {
                            sessionStorage.clear(); 
                            window.location.replace('/');
                            return;
                        }
                        
                        const errBtn = showError(msg.error);
                        errBtn.addEventListener('click', () => removeError(errBtn));
                        // Fall-through preserved intentionally
                    }
                case 'Escape':
                    addNewRoom(false, null);
                    addroom.addEventListener('click', addRoomHandler);
                    break;
            }
        };
    
        newRoomDiv.addEventListener('keydown', newRoomHandler);
        addroom.removeEventListener('click', addRoomHandler);
    };
    
    addroom.addEventListener('click', addRoomHandler);
    
    const addUserHandler = () => {
        const newUserDiv = addNewUserInput();
        const newUserHandler = async (event) => {
            switch (event.key) {
                case 'Enter':
                    const newUserName = getNewUserName();
                    if (rooms.length === 0) {
                        addNewUser(false, null);
                        const errBtn = showError("You are not in any rooms yet");
                        errBtn.addEventListener('click', () => removeError(errBtn));
                        adduser.addEventListener('click', addUserHandler);
                        break;
                    } else {
                        const room = rooms[currentRoom].split('.');
                        const response = await requestNewUser(newUserName, room[0], room[1], token);
                        const msg = await response.json();
                        
                        if (response.ok) {
                            updateUi(room);
                        } else {
                            if (msg.error === "Invalid or expired token") {
                                sessionStorage.clear();
                                window.location.replace('/');
                                return;
                            }
                        
                            const errBtn = showError(msg.error);
                            errBtn.addEventListener('click', () => removeError(errBtn));
                            // Fall-through preserved intentionally
                        }
                    }
                case 'Escape':
                    addNewUser(false, null);
                    adduser.addEventListener('click', addUserHandler);
                    break;
            }
        };
        newUserDiv.addEventListener('keydown', newUserHandler);
        adduser.removeEventListener('click', addUserHandler);
    };
    
    adduser.addEventListener('click', addUserHandler);
    
    sendMsg.addEventListener('click', async () => {
        message();
        clearMsgBar();
    });
    
    messageBar.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            message();
            clearMsgBar();
        }
    });
}

 export function setupDelegatedRoomListeners() {
    const sidebar = document.querySelector('.rooms-list') || document.body;

    sidebar.addEventListener('click', async (e) => {
        const roomBtn = e.target.closest('.roomName');
        if (!roomBtn) return;

        const xBtn = e.target.closest('.roomName button');
        
        const currentRoomsStr = sessionStorage.getItem('rooms');
        rooms = currentRoomsStr ? currentRoomsStr.split(',') : [];

        if (xBtn) {
            e.stopPropagation();
            const errBtn = confirmLeave();

            errBtn.addEventListener('click', async (event) => {
                event.stopPropagation();
                document.body.removeEventListener('click', bodyHandler);
                removeError(errBtn);

                const roomItem = roomBtn;
                const allRoomNodes = Array.from(sidebar.querySelectorAll('.roomName'));
                const targetIndex = allRoomNodes.indexOf(roomItem);

                if (targetIndex === -1 || !rooms[targetIndex]) return;

                const roomId = rooms[targetIndex].split('.')[0];
                leaveRoom(roomId, token);

                rooms.splice(targetIndex, 1);
                sessionStorage.setItem('rooms', rooms.join(','));

                removeRoom(roomItem);

                if (rooms.length > 0) {
                    currentRoom = 0;
                    updateUi(rooms[0].split('.'));
                } else {
                    currentRoom = 0;
                    updateRoomTitle('Add a room to get started');
                }
            });

            const bodyHandler = (event) => {
                event.stopPropagation();
                document.body.removeEventListener('click', bodyHandler);
                removeError(errBtn);
            };

            document.body.addEventListener('click', bodyHandler);
            return;
        }

        currentRoom = getCurrentRoom(roomBtn, rooms);
        if (rooms[currentRoom]) {
            updateUi(rooms[currentRoom].split('.'));
        }
    });
}

export function getCurrentRoomIndex() {
    return currentRoom;
}

export async function updateUi(splitRoom) {
    if (!splitRoom || splitRoom.length < 2) return;

    let res1 = await getUsers(splitRoom[0], token);
    if (res1.ok) {
        const msg = await res1.json();
        displayUsers(username, msg.users);
    }

    let res2 = await getMessages(splitRoom[0], token);
    if (res2.ok) {
        const msg = await res2.json();
        displayMessages(msg.messages);
    }

    updateRoomTitle(splitRoom[1]);
}

async function message() {
    const currentRoomsStr = sessionStorage.getItem('rooms');
    const localRooms = currentRoomsStr ? currentRoomsStr.split(',') : [];
    const text = getMessage();

    if (localRooms.length === 0 || !localRooms[currentRoom]) {
        const errBtn = showError('You are not in any rooms yet');
        errBtn.addEventListener('click', () => removeError(errBtn));
        return;
    }

    const roomId = localRooms[currentRoom].split('.')[0];
    const response = await sendMessage(token, roomId, text);
    const msg = await response.json();

    if (response.ok) {
        addMessage(username, text);
    } else {
        const errBtn = showError(msg.error);
        errBtn.addEventListener('click', () => removeError(errBtn));
    }
}