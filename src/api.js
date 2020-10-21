// change this when you integrate with the real API, or when u start using the dev server
const API_URL = 'http://localhost:5000'

const getJSON = (path, options) => 
    fetch(path, options)
        .then(res => res.json())
        .catch(err => console.warn(`API_ERROR: ${err.message}`));

/**
 * This is a sample class API which you may base your code on.
 * You may use this as a launch pad but do not have to.
 */
export default class API {
    /** @param {String} url */
    constructor(url = API_URL) {
        this.url = url;
    } 

    makeAPIRequest(path, options) {
        return getJSON(`${this.url}/${path}`, options);
    }    
    
    get_request(path, options) {
        const response = this.makeAPIRequest(path, options);
        return response;
    }
    
    get_user(token, options) {
        return this.makeAPIRequest(`user/`, options);
    }
    
    get_user_from_id(id, token) {
        return this.makeAPIRequest(`user/?id=${id}`, { method: 'GET', headers: {'Authorization': token}});
    }
    
    get_user_from_username(username, token) {
        return this.makeAPIRequest(`user/?username=${username}`, { method: 'GET', headers: {'Authorization': token}});
    }
    
    // async get_feed(path,options) {
    //     const response = await getJSON(path, options);
    //     return response;
    // }
    
    
}
