/**
 * Performs a GET request to `${BASE_URL}${path}.json` and returns parsed JSON.
 *
 * @template T
 * @param {string} [path=""] - Path relative to BASE_URL (without leading slash).
 * @returns {Promise<T>} Parsed JSON response.
 * @throws {TypeError} If the network request fails (fetch error).
 */
async function loadData(path = "") {
  let response = await fetch(BASE_URL + path + ".json");
  return (responseToJson = await response.json());
}

/**
 * Performs a POST request to `${BASE_URL}${path}.json` with a JSON body.
 * This creates a new child (push) under the specified path and returns
 * an object containing the generated key (Firebase returns `{ name: "<key>" }`).
 *
 * @template T
 * @param {string} [path=""] - Path relative to BASE_URL (without leading slash).
 * @param {any} [data={}] - Data to serialize and send as JSON.
 * @returns {Promise<T>} Parsed JSON response.
 * @throws {TypeError} If the network request fails (fetch error).
 */
async function postData(path = "", data = {}) {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return (responseToJson = await response.json());
}

/**
 * Performs a PUT request to `${BASE_URL}${path}.json` with a JSON body.
 * This overwrites the data at the specified path.
 *
 * @template T
 * @param {string} [path=""] - Path relative to BASE_URL (without leading slash).
 * @param {any} [data={}] - Data to serialize and send as JSON.
 * @returns {Promise<T>} Parsed JSON response.
 * @throws {TypeError} If the network request fails (fetch error).
 */
async function putData(path = "", data = {}) {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}

/**
 * Performs a DELETE request to `${BASE_URL}${path}.json`.
 * Deletes the node at the specified path.
 *
 * @template T
 * @param {string} [path=""] - Path relative to BASE_URL (without leading slash).
 * @returns {Promise<T>} Parsed JSON response (Firebase typically returns `null`).
 * @throws {TypeError} If the network request fails (fetch error).
 */
async function deleteData(path = "") {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "DELETE",
  });
  return (responseToJson = await response.json());
}
