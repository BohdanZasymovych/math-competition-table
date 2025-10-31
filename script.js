let refresh_counter = 0

// simple toast helper
function showToast(message, duration = 3000) {
    try {
        const container = document.getElementById('toast-container') || (() => {
            const d = document.createElement('div'); d.id = 'toast-container'; document.body.appendChild(d); return d;
        })();
        const el = document.createElement('div');
        el.className = 'toast';
        el.textContent = message;
        container.appendChild(el);
        // force reflow then show
        requestAnimationFrame(() => el.classList.add('show'));
        // hide after duration
        setTimeout(() => {
            el.classList.remove('show');
            el.classList.add('hide');
            setTimeout(() => el.remove(), 300);
        }, duration);
    } catch (e) {
        console.log('Toast:', message);
    }
}


// Teams' Answer Submission Form | START
const submissionDiv = document.getElementById("input-command")

const submission_team_list = document.getElementById("submission-team-list")
const submission_task_list = document.getElementById("submission-task-number-list")
const submission_answer = document.getElementById("is-correct")
// Teams' Answer Submission Form | END

// Task Points Table | START
const task_points_table = document.getElementById("task-points")
// Task Points Table | END


// Teams' Points Table | START
const team_points_table = document.getElementById("there-are-teams-here")
// Teams' Points Table | END


const _TEAM_NAMES = [
    "Шалені бджілки",
    "блок ППО",
    "Фан-клуб пана Степана",
    "РМДТ",
    "душніла кчау",
    "Minions",
    "ЕЛВІН І БУРУНДУКИ"
]

const _TOTAL_NUMBER_OF_TEAMS = _TEAM_NAMES.length

const _TEAM_IDS = [
    "ShaleniBdzilky",
    "blokPPO",
    "FanClubPanStepan",
    "RMDT",
    "DushnilaKchau",
    "Minions",
    "ElvinAndBurunduki"
]

const _INITIAL_TEAM_POINTS = [0, 0, 0, 0, 0, 0, 0]

const _TOTAL_NUMBER_OF_TASKS = 10
const _INITIAL_TASK_POINTS = 10

let _TEAM_POINTS = [..._INITIAL_TEAM_POINTS]
let _DYNAMIC_TASK_POINTS = new Array(_TOTAL_NUMBER_OF_TASKS).fill(_INITIAL_TASK_POINTS);


// adds the options to submission Team List
document.addEventListener("DOMContentLoaded", function() {
    submission_team_list.innerHTML = "";
    _TEAM_NAMES.forEach((team_name, index) => {
       let option = `<option value="${_TEAM_IDS[index]}">${team_name}</option>`;
       submission_team_list.innerHTML += option;
    })
})

function getSortingIndices(arr) {
    const arrayWithIndices = arr.map((value, index) => ({ value, index }));
    arrayWithIndices.sort((a, b) => b.value - a.value);
    return arrayWithIndices.map(obj => obj.index);
}


function updateTaskPointsTable() {
    task_points_table.innerHTML = "";

    for (let i = 0; i < _TOTAL_NUMBER_OF_TASKS; i++) {
        let row =
            `<tr id=${i}>
                <td class="rank">${i + 1}</td>
                <td class="points">${_DYNAMIC_TASK_POINTS[i]}</td>
            </tr>`
        task_points_table.innerHTML += row;
    }
}

function updateTeamsInTable() {
    const sorted_team_indices = getSortingIndices(_TEAM_POINTS);

    const team_ids = sorted_team_indices.map((index) => _TEAM_IDS[index]);
    const team_names = sorted_team_indices.map((index) => _TEAM_NAMES[index]);
    const team_points = sorted_team_indices.map((index) => _TEAM_POINTS[index]);

    team_points_table.innerHTML = "";

    for (let i = 0; i < _TOTAL_NUMBER_OF_TEAMS; i++) {
        let row =
            `<tr id=${team_ids[i]}>
                <td class="rank">${i + 1}</td>
                <td class="team">${team_names[i]}</td>
                <td class="points">${team_points[i]}</td>
            </tr>`;
        team_points_table.innerHTML += row;
    }
}

function updateHTML() {
    updateTeamsInTable()
    updateTaskPointsTable()
}

updateHTML()


const _SUBMISSIONS_KEY = "submissions"
class Submission {
    // `task_number` is from `1` to `_TOTAL_NUMBER_OF_TASKS`.
    // `is_correct` is `true` or `false`.
    constructor(team_id, task_index, is_correct) {
        this.team_id = team_id
        this.task_index = task_index
        this.is_correct = is_correct
    }
}


function wasAlreadySubmitted(submission) {
    for (let i = 0; i < SUBMISSIONS.length; i++) {
        if (SUBMISSIONS[i].team_id === submission.team_id && SUBMISSIONS[i].task_index === submission.task_index) {
            return true
        }
    }
    return false
}

function processSubmission(submission, verify_if_already_submitted) {
    // Process a single submission and return a result object describing what happened.
    // This lets callers show accurate messages (points awarded, duplicates ignored, etc.).
    if (verify_if_already_submitted && wasAlreadySubmitted(submission)) {
        return { counted: false, reason: 'duplicate', submission };
    }

    if (submission.is_correct) {
        const pointsAwarded = _DYNAMIC_TASK_POINTS[submission.task_index];
        _TEAM_POINTS[_TEAM_IDS.indexOf(submission.team_id)] += pointsAwarded;
        _DYNAMIC_TASK_POINTS[submission.task_index] = Math.max(1, _DYNAMIC_TASK_POINTS[submission.task_index] - 1);
        if (verify_if_already_submitted) {
            SUBMISSIONS.push(submission);
        }
        return { counted: true, type: 'correct', pointsAwarded, submission };
    } else {
        _DYNAMIC_TASK_POINTS[submission.task_index] += 1;
        // reward +1 to any previously-correct teams for this task
        let rewarded = 0;
        for (let i = 0; i < SUBMISSIONS.length; i++) {
            if (SUBMISSIONS[i].task_index === submission.task_index && SUBMISSIONS[i].is_correct) {
                _TEAM_POINTS[_TEAM_IDS.indexOf(SUBMISSIONS[i].team_id)] += 1;
                rewarded += 1;
            }
        }
        if (verify_if_already_submitted) {
            SUBMISSIONS.push(submission);
        }
        return { counted: true, type: 'wrong', newTaskValue: _DYNAMIC_TASK_POINTS[submission.task_index], rewarded, submission };
    }
}


// Important: changes HTML tables as well
function processSubmissions(submissions, verify_if_already_submitted) {
    const results = [];
    for (let i = 0; i < submissions.length; i++) {
        const res = processSubmission(submissions[i], verify_if_already_submitted);
        results.push(res);
    }
    saveSubmissions();
    updateHTML();
    return results;
}


let localStorageSubmissions = localStorage.getItem(_SUBMISSIONS_KEY) || '[]'
let SUBMISSIONS = JSON.parse(localStorageSubmissions)

processSubmissions(SUBMISSIONS, false)


function readNewSubmission() {
    const submission = new Submission(
        submission_team_list.value,  // ID is stored as the value
        (+submission_task_list.value) - 1,
        Boolean(+submission_answer.value)
    )
    const results = processSubmissions([submission], true)
    // results is an array with one element describing what happened
    if (results && results[0]) {
        const r = results[0]
        const teamIndex = _TEAM_IDS.indexOf(submission.team_id)
        const teamName = _TEAM_NAMES[teamIndex] || submission.team_id
        const taskNumber = submission.task_index + 1
        if (!r.counted) {
            if (r.reason === 'duplicate') {
                showToast(`${teamName} — Task ${taskNumber}: already submitted (ignored)`, 3500)
            } else {
                showToast('Submission ignored', 3000)
            }
        } else if (r.type === 'correct') {
            showToast(`${teamName} — Task ${taskNumber}: Correct (+${r.pointsAwarded} pts)`, 3500)
        } else if (r.type === 'wrong') {
            if (r.rewarded > 0) {
                showToast(`${teamName} — Task ${taskNumber}: Wrong — task value is now ${r.newTaskValue}. ${r.rewarded} previously solved teams received +1.`, 4200)
            } else {
                showToast(`${teamName} — Task ${taskNumber}: Wrong — task value is now ${r.newTaskValue}.`, 3500)
            }
        } else {
            showToast('Submission recorded', 3000)
        }
    } else {
        showToast('Submission recorded', 3000)
    }
}


function button_is_pressed() {
    if (refresh_counter % 2 === 0) {
        submissionDiv.style.visibility = "visible"
    } else {
        submissionDiv.style.visibility = "hidden"
        readNewSubmission()
    }
    refresh_counter += 1
}


function saveSubmissions() {
    localStorage.setItem(_SUBMISSIONS_KEY, JSON.stringify(SUBMISSIONS))
}


function cancelPrevSubmission() {
    const removed_submission = SUBMISSIONS.pop()
    console.log("REMOVED: ", removed_submission)

    // reset state and reprocess remaining submissions
    _DYNAMIC_TASK_POINTS = new Array(_TOTAL_NUMBER_OF_TASKS).fill(_INITIAL_TASK_POINTS);
    _TEAM_POINTS = [..._INITIAL_TEAM_POINTS]

    processSubmissions(SUBMISSIONS, true)

    // show a toast describing what was removed
    if (removed_submission) {
        try {
            const teamIndex = _TEAM_IDS.indexOf(removed_submission.team_id)
            const teamName = _TEAM_NAMES[teamIndex] || removed_submission.team_id
            const taskNumber = removed_submission.task_index + 1
            const resultText = removed_submission.is_correct ? 'Correct' : 'Wrong'
            showToast(`Removed: ${teamName} — Task ${taskNumber} (${resultText})`)
        } catch (e) {
            showToast('Last submission removed')
        }
    } else {
        showToast('No submission to remove')
    }
}





///// TIMER

const display = document.querySelector('#safeTimerDisplay');
let TimerIntervalID
const COMPETITION_STAGE = "COMPETITION_STAGE"


function START_COMPETITION() {

    _DYNAMIC_TASK_POINTS = new Array(_TOTAL_NUMBER_OF_TASKS).fill(_INITIAL_TASK_POINTS);
    _TEAM_POINTS = [..._INITIAL_TEAM_POINTS]
    updateHTML()

    clearInterval(TimerIntervalID)

    let time = 3599

    TimerIntervalID = startTimer(time, display);

    localStorage.setItem(COMPETITION_STAGE, "STARTED")
    decideIfSHowStartButton()
}

function decideIfSHowStartButton() {
    if (localStorage.getItem(COMPETITION_STAGE) === "STARTED") {
        document.getElementById("START").style.visibility = "hidden"
    }
}

function loadTimerIfPossible() {
     if (localStorage.getItem(COMPETITION_STAGE) === "STARTED") {
        TimerIntervalID = startTimer(+localStorage.getItem("timer"), display);
     }
}


decideIfSHowStartButton()
loadTimerIfPossible()
