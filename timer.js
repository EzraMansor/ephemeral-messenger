import { addTasks } from "./task.js";

let timerInterval; // variable to store the interval id to stop later
let time;
let taskTime;
let deltaTime = 0;
let prevTime;
let timeElapsed = 0;
let originalTime;

// make the timer element global
const $timer = $('#timer');
const $timerStart = $('#timerStart');
const $timerStop = $('#timerStop');
const $timerReset = $('#timerReset');

// helper function to update the time according to the timer (used on page load  and while resetting the timer)
const updateTime = () => {
    const timerFields = $timer.text().split(':');
    time = (parseInt(timerFields[0], 10) * 3600) + (parseInt(timerFields[1], 10) * 60) + parseInt(timerFields[2], 10); 
}

// loop to count down and update the timer every second
const countdown = () => {
    // decrement the timer by a second
    time--;
    taskTime--;

    updateTimer();
    updateTaskTimer();

    // increment prevTime by a second
    // (not setting prevTime to performance.now() because the cpu never manages to check the time exactly after a second and by setting prevTime = performance.now() that extra time is not considered)
    // (in this method that extra time carries over to the next check)
    prevTime += 1000;
};

const updateTimer = () => {
    // get separate values for hour, minute and second
    let hour = parseInt(Math.abs(time) / 3600);
    let minute = parseInt((Math.abs(time) % 3600) / 60);
    let second = Math.abs(time) % 60;
    let sign = time < 0 ? '-' : ''; // add a negative sign at the beginning if the time is negative

    // pad all the numbers so they have a single leading zero if required and then update the timer
    $timer.text(sign + hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0') + ':' + second.toString().padStart(2, '0'));
}

const updateTaskTimer = () => {
    let hour = parseInt(Math.abs(taskTime) / 3600);
    let minute = parseInt((Math.abs(taskTime) % 3600) / 60);
    let second = Math.abs(taskTime) % 60;
    let sign = taskTime < 0 ? '-' : '';
 
    $('.active time').text(sign + hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0') + ':' + second.toString().padStart(2, '0'));
}

const updateDeltaTimer = () => {
    let hour = parseInt(Math.abs(deltaTime) / 3600);
    let minute = parseInt((Math.abs(deltaTime) % 3600) / 60);
    let second = Math.abs(deltaTime) % 60;
    let sign = deltaTime < 0 ? '-' : '';
 
    $('#deltaTimer').text('Delta: ' + sign + hour.toString().padStart(2, '0') + ':' + minute.toString().padStart(2, '0') + ':' + second.toString().padStart(2, '0'));
}

export const addTime = t => {
    if (t) {
        time += t;
        updateTimer();
    }

    // make the timer button clickable once a task is added
    $timerStart.removeClass('inactive');
}


export const getTaskTime = () => {
    // get the time of the active task, and set it to zero if it isn't positive
    const taskTimeFields = $('.active time').text().split(':');
    taskTime = parseInt(taskTimeFields[0]) * 3600 + parseInt(taskTimeFields[1]) * 60 + parseInt(taskTimeFields[2]);
    if (!taskTime) taskTime = 0;
}

export const addDeltaTime = () => {
    deltaTime += taskTime;
    updateDeltaTimer();
} 

export const resetTimer = () => {
    clearInterval(timerInterval);
    timerInterval = null;

    // reset the timer
    time = 0;
    updateTimer();

    timeElapsed = 0;

    // recalculate the time
    updateTime();

    // clear all the tasks and then add them back in
    $('#toDoList ul li.task').remove();
    addTasks();

    // reset the buttons
    $timerStart.removeClass('inactive');
    $timerStop.addClass('inactive');
}

export const initTimer = () => {
    if ($('#toDoList ul li.task').length) getTaskTime();

    // update the time variable at the beginning
    updateTime();

    // start the countdown once the button to start the timer is clicked
    $timerStart.on('click', () => {
        // store the orginal time to reset to later
        originalTime = $timer.html();
        
        // set the fist task as the active task
        $('ul li.task p:not(.completed)').first().parent().addClass('active');

        getTaskTime();

        // ignore click if the timer is already running
        if (timerInterval) return;
        
        // store the starting time of the timer to accurately measure the time later
        // slide prevTime back by the amount of miliseconds that has already passed since the last timer update (timeElapsed)
        // this is done so that when the timer is started again, it doesn't grant the user extra time by ticking after a full second and instead goes off sooner
        prevTime = performance.now() - timeElapsed;
        
        // set an interval to update the timer
        timerInterval = setInterval(() => {while (performance.now() - prevTime >= 1000) countdown()}, 200); // check if one second has passed, if so update the timer 
        
        // make the timer start button inactive and make the timer stop button active
        $timerStart.toggleClass('inactive');
        $timerStop.toggleClass('inactive');
    });

    // clear the interval when the button to stop the timer is clicked
    $timerStop.on('click', () => {
        if(!timerInterval) return // ignore the button click if the timer is not running
        clearInterval(timerInterval);
        timerInterval = null;

        // calculate the amount of miliseconds that has passed since the last timer update
        timeElapsed = performance.now() - prevTime;
        
        // checking to see if a loop was pending
        while (timeElapsed > 1000) {
            countdown();
            timeElapsed -= 1000; // decrement timeElapsed by 1000 to compensate for prevTime being incremented in countdown()
        }

        // make the timer stop button inactive and make the timer start button active again
        $timerStart.toggleClass('inactive');
        $timerStop.toggleClass('inactive');
 });

    // reset everything when the reset button is clicked
    $timerReset.on('click', resetTimer);
}