/**
 * Task API helpers: provide per-user task endpoints and seeding for new users.
 */
const TASKS_BASE_URL = "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

/**
 * Return URL for this user's tasks collection
 * @returns {string}
 */
function getUserTasksUrl() {
	return `https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/users/${USERKEY}/tasks.json`;
}

/**
 * Return URL for a specific user task item
 * @param {string} id
 * @returns {string}
 */
function getUserTaskItemUrl(id) {
	return `https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/users/${USERKEY}/tasks/${id}.json`;
}

/**
 * Seed up to 5 tasks for a new user from the global base tasks.
 * If the user already has tasks, this is a no-op.
 */
async function seedUserTasksIfEmpty() {
	if (!USERKEY) return;
	try {
		const userResp = await fetch(getUserTasksUrl());
		const userData = await userResp.json();
		if (userData && Object.keys(userData).length > 0) return; // already has tasks

		const baseResp = await fetch(TASKS_BASE_URL);
		const baseData = (await baseResp.json()) || {};
		const entries = Object.entries(baseData);
		if (entries.length === 0) return;

		const toSeed = entries.slice(0, 5).map(([, task]) => task);
		await Promise.all(toSeed.map(task => fetch(getUserTasksUrl(), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(task)
		})));
	} catch (err) {
		console.error('Error seeding user tasks:', err);
	}
}

// functions are intentionally global for other scripts to use

