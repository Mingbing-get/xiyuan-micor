//get请求
export function httpGet(url) {
    return fetch(url);
}

//post请求
export function httpPost(url, params) {
    const result = fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: new Headers({
            'Accept': 'application/json',
            "Content-Type": "application/json",
        }),
        body:params
    });
    return result;
}