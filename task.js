import { addDeltaTime, addTime, getTaskTime, resetTimer } from "./timer.js";

const $addTask = $('#addTask');

let tasks;

const addNewTask = (name, hour, minute, second) => {
    // concatanate everything into valid duration syntax for the datetime attribute of the time tag
    const time = `"PT${hour}H${minute}M${second}S"`

    // html for the p tag holding the name of the task
    const taskName = `<p>${name}</p>`;
    // the time tag showing the duration of the task
    // yes it's incredibly long but I'm too lazy to break it up into smaller chunks
    const taskTime = `<time datetime=${time}>${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}</time>`;
    const $newTask = $(`<li class="task"><button class="completeTask">O</button>${taskName}${taskTime}<button class='deleteTask'>X</button></li>`);

    // add the new task right before the add task button (at the end of the list)
    $addTask.before($newTask);
    // update the time variable in timer.js and also the timer
    addTime(hour * 3600 + minute * 60 + second);

    // return the li element that was just added
    return $newTask;
}

export const addTasks = () => {
    tasks = JSON.parse(localStorage.getItem('tasks'));
    if (!tasks) {tasks = []; return};

    tasks.forEach(task => {
        const hour = parseInt(task.time / 3600);
        const minute = parseInt((task.time % 3600) / 60);
        const second = task.time % 60;

        // addNewTask() returns the li element that was just added
        const $newTask = addNewTask(task.name, hour, minute ,second);
        
        const styleAsCompleted = ($button) => {
            $button.siblings('p').addClass('completed');
            $button.prop('disabled', true);
        }

        // check if the task that was added is completed, if so render it as completed
        if (task.isCompleted) {
            // render the li as completed
            styleAsCompleted($newTask.children('button.completeTask'));
        }
    })
}

const completeTask = $button => {
    // update the delta timer
    addDeltaTime();
    
    // Strike through the sibling elements (the p and time tags)
    $button.siblings('p').addClass('completed');
    
    // disable the button so the user can't complete it twice
    $button.prop('disabled', true);

    // get the index of the task that was clicked relative to its siblings
    const index = $button.index('#toDoList ul li.task button.completeTask');
    // set the isCompleted paramter of the corrosponding task object in the tasks array
    tasks[index].isCompleted = true;

    // save the new array to local storage
    localStorage.setItem('tasks', JSON.stringify(tasks));

    if ($button.parent().hasClass('active')) {
        $button.parent().removeClass('active');
        
        const $firstPendingTask = $('#toDoList ul li.task p:not(.completed)').first().parent();
        
        // all tasks have been completed
        if(!$firstPendingTask.length) {
            localStorage.clear();
            alert("you've successfully completed this session! Hurray!");
            // reload the page with no local storage so the user is left with a fresh new session
            return;
        }

        $firstPendingTask.addClass('active');
        // update the taskTime variable to the time of the active task
        getTaskTime();
    }
}

const deleteTask = $el => {
    // get the index of the li relative to its siblings
    const index = $el.index('#toDoList ul li.task button.deleteTask');

    // remove the li
    $el.parent().remove();
    // reduce the time of the timer by the time of that task
    addTime(tasks[index].time * -1);
    // remove the task from the array
    tasks.splice(index, 1);
    // set the array to local storage
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // disable the timer start button if there is no task
    if (!tasks.length) $('#timerStart').addClass('inactive');
}
        
export const initTask = () => {
    // add all of the tasks on page load
    addTasks();

    $addTask.on('click', () => {
        if ($('#toDoList ul li input').length > 0) return; // ignore click if there is already an input field

        const $nameInput = '<input id="nameInput" type="text" placeholder="Enter task name"></input>'; // name field
        const $hourInput = '<input id="hourInput" type="number" min="0" max="12" value="00"></input>:'; // hour field
        const $minuteInput = '<input id="minuteInput" type="number" min="0" max="59" value="00"></input>:' // minute field
        const $secondInput = '<input id="secondInput" type="number" min="0" max="59" value="00"></input>' // second field
        const $li = $('<li class="task" id="newTask">' + $nameInput + $hourInput + $minuteInput + $secondInput + '</li>'); // main li

        $addTask.before($li);

        const $name = $('#nameInput');
        const $hour = $('#hourInput');
        const $minute = $('#minuteInput');
        const $second = $('#secondInput');

        const checkInput = () => {
            const name = $name.val();
            const hour = parseInt($hour.val());
            const minute = parseInt($minute.val());
            const second = parseInt($second.val());

            if (!$('#newTask').length) return; // return if no new task li is not found

            if ($name.val().trim() == '') {
                $name.css('background-color', 'red'); // turn the input element red to indicate an invalid name
                return;
            } else {
                $name.css('background-color', 'white'); // in case they have supplied an incorrect name before clear the error
            }
            
            if (hour + minute + second > 0) {
                // remove the add new task li
                $li.remove();

                // add a new task li
                addNewTask(name, hour, minute, second);

                // create an object representing the last added task to append to the tasks array
                const newTask = {
                    name: name,
                    time: hour * 3600 + minute * 60 + second,
                    isCompleted: false
                }

                // add the new task to the array and add it back to local storage
                tasks.push(newTask);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                
                $addTask.off('click.addNewTask');
            } else {
                $('#hourInput, #minuteInput, #secondInput').css('background-color', 'red');
            };
        }

        // Clean event delegation setup replacing the original dynamic click.addNewTask cycle
        $addTask.off('click.addNewTask');
        $('#toDoList').off('keydown', '#newTask').on('keydown', '#newTask', e => {
            if (e.key === 'Enter') checkInput();
        });
        $('#toDoList').off('click', '#addTask').on('click', '#addTask', checkInput);
    })

    $('#toDoList').on('click', '.completeTask', function() {
        completeTask($(this));
    });

    $('#toDoList').on('click', '.deleteTask', function() {
        deleteTask($(this));
    });
}