function onloadFunc() {
    
}
 
const BASE_URL = "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/";

/* Servus, ich habe es mal so versucht da es mir die User nicht mehr geladen hat, damit bekomme ich die angemeldeten User in Assigned to wieder angezeigt auf addTask:
window.BASE_URL = "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/";
*/


async function loadData(path="") {
    let response = await fetch(BASE_URL + path +  ".json");
    return responseToJson = await response.json();
}
    
/*
async function loadData(path = "") {
    const response = await fetch(BASE_URL + path + ".json");
    return await response.json();
}
*/

async function postData (path="", data={}) {
    let response = await fetch(BASE_URL + path +  ".json",{
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify(data)
    });
    return responseToJson = await response.json();
   /* return await response.json();*/
    
}

async function putData (path="", data={}) {
    let response = await fetch(BASE_URL + path +  ".json",{
        method: "PUT",
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}
 
async function deleteData(path="") {
    let response = await fetch(BASE_URL + path +  ".json",{
        method: "DELETE",
    });
    return responseToJson = await response.json();
    /*return await response.json();*/

}