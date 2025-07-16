const OVERLAY = document.getElementById('overlay');
const OVERLAY_CONTENT = document.getElementById('overlayContent');
const TASKS_BASE_URL = "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";



if (!USERKEY) {
    // Kein Benutzer eingeloggt → weiterleiten
    window.location.href = "../../index.html";
}

let currentDraggedElement;
/*
function init() {
  document.getElementById('searchInput').value = '';
}
*/

function closeOverlay() {
    // Remove animation class
    OVERLAY_CONTENT.classList.remove('active');

    // Hide the overlay after animation
    setTimeout(() => {
        OVERLAY.classList.add('display-none');
        OVERLAY_CONTENT.classList.remove('add-task');
        OVERLAY_CONTENT.innerHTML = '';
    }, 110);
}


function notContentClickClose(event) {
    if (event.target === OVERLAY) {
        closeOverlay();
    }
}


let saveTaskDataTo = (columnId) => {
    const TASKTITLE = document.getElementById('taskTitle').value;
    const TASKDESCRIPTION = document.getElementById('taskDescription').value;
    const TASKDUEDATE = document.getElementById('taskDueDate').value;
    const TASKCATEGORY = document.getElementById('taskCategory').textContent;
    const TASKASSIGNEE = Array.from(document.querySelectorAll('#selectedAssignee .contact-icon')).map(span => span.dataset.name);
    const PRIORITY_BTN = document.querySelector('.priority-button.active');
    const PRIORITY = PRIORITY_BTN ? PRIORITY_BTN.classList[PRIORITY_BTN.classList.length - 2] : '';
    const SUBTASKS = Array.from(document.querySelectorAll('.subtask-text')).map(subtask => ({
        value: subtask.textContent,
        checked: false
    }));
    const REQUIRED_SPAN_HINT = document.querySelectorAll('.required-span');
    const REQUIRED_INPUTS = document.querySelectorAll('.requierd-input');

    let taskData = {
        title: TASKTITLE,
        description: TASKDESCRIPTION,
        dueDate: TASKDUEDATE,
        category: TASKCATEGORY,
        assignee: TASKASSIGNEE,
        priority: PRIORITY,
        subtasks: SUBTASKS,
        column: columnId
    };
    // Validierung der Eingabedaten
    if (!TASKTITLE || !TASKDUEDATE || !TASKCATEGORY) {
        REQUIRED_SPAN_HINT.forEach(span => {
            span.classList.remove('display-none');
            REQUIRED_INPUTS.forEach(input => {
                input.classList.add('correct-me');
            });

        });
        return null;
    } else {
        return taskData;
    }
}


async function taskDataPush(columnId) {
  const taskData = saveTaskDataTo(columnId);
  if (!taskData) return Promise.reject('No task data');
  
  return fetch(TASKS_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)   
  });
}

function updateColumns(tasks) {
    const COLUMNS = ['todoColumn', 'inProgressColumn', 'awaitFeedbackColumn', 'doneColumn'];

    // Spalten leeren - sowohl Tasks als auch no-task Karten
    COLUMNS.forEach(col => {
        const column = document.getElementById(col);
        // Entferne alle Task-Karten und no-task-item Elemente
        const elementsToRemove = column.querySelectorAll('.task-card, .no-task-item');
        elementsToRemove.forEach(element => element.remove());
    });

    // Tasks gruppieren und sortieren
    const tasksByColumn = groupAndSortTasks(tasks);

    // Tasks rendern
    COLUMNS.forEach(col => {
        const column = document.getElementById(col);
        let dragArea = column.querySelector('.drag-area');
        
        // Wenn keine Drag-Area existiert, erstelle eine neue
        if (!dragArea) {
            const dragAreaIds = ['toDoDragArea', 'inProgressDragArea', 'awaitingFeedbackDragArea', 'doneDragArea'];
            const index = COLUMNS.indexOf(col);
            dragArea = document.createElement('div');
            dragArea.className = 'drag-area display-none';
            dragArea.id = dragAreaIds[index];
            dragArea.style.pointerEvents = 'none';
            column.appendChild(dragArea);
        }
        
        tasksByColumn[col].forEach(task => {
            // Füge Task vor der Drag-Area ein
            dragArea.insertAdjacentHTML('beforebegin', taskCardTemplate(task));
        });
    });
}

function groupAndSortTasks(tasks) {
    const tasksByColumn = {
        todoColumn: [], inProgressColumn: [],
        awaitFeedbackColumn: [], doneColumn: []
    };
    // Gruppiere Tasks nach Spalten
    tasks.forEach(task => {
        if (tasksByColumn[task.column]) { tasksByColumn[task.column].push(task); }
    });
    // Sortiere nach movedAt
    Object.keys(tasksByColumn).forEach(col => {
        tasksByColumn[col].sort((a, b) => (a.movedAt || 0) - (b.movedAt || 0));
    });
    return tasksByColumn;
}


function checkEmptyColumn() {
    const boardColumns = document.querySelectorAll('.board-column');
    boardColumns.forEach(column => {
        if (!column.querySelector('.task-card')) {
            // Speichere die Drag-Area vor dem Überschreiben
            const dragArea = column.querySelector('.drag-area');
            
            // Füge no-task template hinzu
            column.innerHTML = noTaskCardTemplate();
            
            // Füge die Drag-Area wieder hinzu, falls sie existierte
            if (dragArea) {
                column.appendChild(dragArea);
            }
        }
    });
}

function updateBoard() {
  fetch(TASKS_BASE_URL)
    .then(response => response.json())
    .then(data => {
      const tasks = Object.entries(data || {}).map(([firebaseKey, task]) => ({
        ...task,
        id: firebaseKey
      }));

      updateColumns(tasks);
      checkEmptyColumn();

      // 🧠 Neue Zähllogik für jede Spalte:
      const countByColumn = {
        todo: 0,
        inProgress: 0,
        awaitFeedback: 0,
        done: 0
      };

      tasks.forEach(task => {
        switch (task.column) {
          case 'todoColumn':
            countByColumn.todo++;
            break;
          case 'inProgressColumn':
            countByColumn.inProgress++;
            break;
          case 'awaitFeedbackColumn':
            countByColumn.awaitFeedback++;
            break;
          case 'doneColumn':
            countByColumn.done++;
            break;
        }
      });

      // 🧪 Testweise in Konsole:
      console.log('Anzahl Tasks:', countByColumn);

      // 📨 Optional: Werte in localStorage speichern, um sie auf der Startseite zu verwenden
      localStorage.setItem("taskCounts", JSON.stringify(countByColumn));
    });
}



function addTask(event , columnId) {
    if (event) event.preventDefault();
    const taskData = saveTaskDataTo(columnId);

    if (!taskData) {
        return;
    }

    taskDataPush(columnId)
        .then(() => {
            updateBoard();
            showAddedTaskNotification();
            setTimeout(() => {
                closeOverlay();
            }, 900);
        });
}

function showAddedTaskNotification() {
    const ADDEDTOBOARDMESSAGE = document.getElementById('addedToBoardMessage');
    ADDEDTOBOARDMESSAGE.classList.remove('display-none');
}

function renderMembers(task) {
    return Array.isArray(task.assignee) ?
        task.assignee.map(name => contactIconSpanTemplate(name)).join('') : ''
}
function renderMembersWithName(task) {
    return Array.isArray(task.assignee) ?
        task.assignee.map(name => `${memberWithNameTemplate(name)}`).join('') : '';
}

function toCamelCase(word) {
    if (!word) return ''; // Fallback für undefined/null
    return (word.charAt(0).toLowerCase() + word.slice(1)).replace(' ', '')
}

function handlePrioritySvg(priority) {
    switch (priority) {
        case 'HighPriority':
            return HIGH_PRIORITY_SVG;
            break;
        case 'MidPriority':
            return MID_PRIORITY_SVG;
            break;
        case 'LowPriority':
            return LOW_PRIORITY_SVG;
            break;
        default:
            return '';
    }
}

function handlePriority(priority) {
    switch (priority) {
        case 'HighPriority':
            return 'High';
            break;
        case 'MidPriority':
            return 'Medium';
            break;
        case 'LowPriority':
            return 'Low';
            break;
        default:
            return '';
    }
}

function handleSubtasks(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return '';
    }

    const completedSubtasks = subtasks.filter(subtask => subtask.checked === true).length;
    const totalSubtasks = subtasks.length;
    const progressPercentage = (completedSubtasks / totalSubtasks) * 100;

    return handleSubtasksTemplate(progressPercentage, completedSubtasks, totalSubtasks);
}

function showCheckedSubtasksCount(subtasks) {
    if (Array.isArray(subtasks) && subtasks.length > 0) {
        return `${subtasks.filter(sub => sub.checked).length}/${subtasks.length}`;
    }
    return '';
}

function visibilityClass(condition) {
    return condition ? '' : ' display-none';
}

function hasFooterData(task) {
    return (Array.isArray(task.assignee) && task.assignee.length > 0) || task.priority;
}

function allowDrop(ev) {
    ev.preventDefault();
}

function startDragging(event, id) {
    const taskCard = document.getElementById(id);
    
    event.dataTransfer.setDragImage(new Image(), 0, 0);
    currentDraggedElement = id;
    taskCard.classList.add('dragging');
}

function stopDragging() {
    if (currentDraggedElement) {
        const element = document.getElementById(currentDraggedElement);
        if (element) {
            element.classList.remove('dragging');
        }
    }
}

function moveTo(column) {
    let element = document.getElementById(currentDraggedElement);
    if (!element) return;
    
    element.classList.remove('dragging');
    
    // Verstecke alle Drag-Areas nach dem Drop
    const allDragAreas = ['toDoDragArea', 'inProgressDragArea', 'awaitingFeedbackDragArea', 'doneDragArea'];
    allDragAreas.forEach(dragAreaId => {
        removeHighlight(dragAreaId);
    });
    
    fetch(TASKS_BASE_URL)
        .then(response => response.json())
        .then(data => {
            const taskEntry = Object.entries(data || {}).find(([key]) => key === currentDraggedElement);
            if (taskEntry) {
                const taskUrl = `https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskEntry[0]}.json`;
                fetch(taskUrl, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ column: column, movedAt: Date.now() })
                }).then(() => { updateBoard(); currentDraggedElement = null; });
            }
        });
}

function highlight(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.remove('display-none');
        
        // Verstecke no-task-item in der gleichen Spalte
        const column = element.parentElement;
        const noTaskItem = column.querySelector('.no-task-item');
        if (noTaskItem) {
            noTaskItem.style.display = 'none';
        }
        
        // Setze die Höhe der Drag-Area gleich der Höhe der gezogenen Task
        if (currentDraggedElement) {
            const draggedTask = document.getElementById(currentDraggedElement);
            if (draggedTask) {
                const taskHeight = draggedTask.offsetHeight;
                element.style.height = taskHeight + 'px';
            }
        }
    }
}

function removeHighlight(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.add('display-none');
        
        // Zeige no-task-item wieder an, falls vorhanden
        const column = element.parentElement;
        const noTaskItem = column.querySelector('.no-task-item');
        if (noTaskItem) {
            noTaskItem.style.display = '';
        }
        
        // Höhe zurücksetzen
        element.style.height = '';
    }
}


function taskOverlay(taskId) {
    fetch(TASKS_BASE_URL)
        .then(response => response.json())
        .then(data => {
            const taskEntry = Object.entries(data || {}).find(([key, task]) => key === taskId);

            if (taskEntry) {
                const [firebaseKey, task] = taskEntry;
                const taskWithId = { ...task, id: firebaseKey };
                showTaskOverlay(taskWithId);
            } else {
                console.error('Task not found:', taskId);
            }
        })
        .catch(error => console.error('Error fetching task:', error));
}

function showTaskOverlay(task) {
    OVERLAY_CONTENT.innerHTML = taskOverlayTemplate(task);
    OVERLAY_CONTENT.classList.add('task-overlay');
    OVERLAY.classList.remove('display-none');

    setTimeout(() => {
        OVERLAY_CONTENT.classList.add('active');
    }, 10);
}

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

/* Search Option 
const debouncedFilter = debounce(filterTasksLive, 300);
document.getElementById('searchInput').addEventListener('input', debouncedFilter);


function filterTasksLive() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  if (!query) return updateBoard(); // if searchfield cleared or page reloaded, page origin shown
  fetch(TASKS_BASE_URL)
    .then(res => res.json())
    .then(data => {
      const tasks = Object.entries(data || {}).map(([id, task]) => ({ ...task, id }));
      const filtered = filterTasksByQuery(tasks, query);
      updateColumns(filtered);
      checkEmptyFiltered(filtered);
    });
}

function filterTasksByQuery(tasks, query) {
  if (!query) return tasks;
  return tasks.filter(t =>
    t.title?.toLowerCase().includes(query) ||
    t.description?.toLowerCase().includes(query)
  );
}

function checkEmptyFiltered(tasks) {
  const colIds = ['todoColumn', 'inProgressColumn', 'awaitFeedbackColumn', 'doneColumn'];
  const dragAreaIds = ['toDoDragArea', 'inProgressDragArea', 'awaitingFeedbackDragArea', 'doneDragArea'];
  
  colIds.forEach((id, index) => {
    const match = tasks.filter(t => t.column === id);
    if (!match.length) {
      const column = document.getElementById(id);
      const dragArea = column.querySelector('.drag-area');
      
      // add no match template
      column.innerHTML = noMatchCard();
      
      // add existing drag area
      if (dragArea) {
        column.appendChild(dragArea);
      }
    }
  });
}

function noMatchCard() {
  return `<div class="no-task-item flexR">No tasks To do</div>`;
}


// starts search after 300ms when user stops typing 
// to conserve resources of firebase connections
//  and to prevent flickering screen
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
*/