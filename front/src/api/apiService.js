const apiUrl = 'http://localhost:8000';

const requestMethods = { get: 'GET', put: 'PUT'};

const endPoints = {
    getOrdersInfo: '/getOrdersInfo',
    modifyOrderState: '/modifyOrderState',
    getCountriesInfo: '/getCountries',
    getNumberOrders: '/getNumberOrders',
    getOrderInfo: '/getOrderInfo'
};

async function fetchFormData(path, { body, method }) {
    let token = localStorage.getItem('token');
    if (!token) token = sessionStorage.getItem('token');
    const headers = new Headers();
    headers.append('Authorization', token);
    console.log(body.values())
    for (var pair of body.entries()) {
        console.log(pair[0]+ ', ' + pair[1]);
    }

    return await fetch(`${apiUrl}${path}`, { method, headers, body });
}

async function fetchApi(path, { body, method }) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    console.log(body)
    const request = await fetch(`${apiUrl}${path}`, { headers: headers, method: method, body: JSON.stringify(body) });
    const requestData = await request.json();

    if (requestData.status === 'error') {
        throw requestData.message;
    }

    return requestData;
}

export async function getOrdersInfo() {
    return await fetchApi(endPoints.getOrdersInfo, {
        method: requestMethods.get,
    });
}

export async function getCountriesInfo() {
    return await fetchApi(endPoints.getCountriesInfo, {
        method: requestMethods.get,
    });
}

export async function getNumberOrders() {
    return await fetchApi(endPoints.getNumberOrders, {
        method: requestMethods.get,
    })
}

export async function modifyOrderState(data, id) {
    const body = new FormData();
    return await fetchFormData(endPoints.modifyOrderState + "/" + id + "?newState=" + data, {
        method: requestMethods.put,
        body
    });
}

export async function getOrderInfo(id) {
    return await fetchApi(endPoints.getOrderInfo + "/" + id, {
        method: requestMethods.get,
    });
}