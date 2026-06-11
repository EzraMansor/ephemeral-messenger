import { initTask } from "./task.js";
import { initTimer } from "./timer.js"

$(document).ready(() => {
    // initialize timer.js
    initTimer();
    // initialize task.js
    initTask();
})