// change this when you integrate with the real API, or when u start using the dev server
const API_URL = 'http://localhost:5000'

const getJSON = (path, options) => 
    fetch(path, options)
        .then(res => res.json())
        .catch(err => console.warn(`API_ERROR: ${err.message}`));

/**
 * This is a sample class API which you may base your code on.
 * You don't have to do this as a class.
 */
export default class API {

    /**
     * Defaults to teh API URL
     * @param {string} url 
     */
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
    
    get_user(id, token) {
        return this.makeAPIRequest(`user/?id=${id}`, { method: 'GET', headers: {'Authorization': token}});
    }
    
    // async get_feed(path,options) {
    //     const response = await getJSON(path, options);
    //     return response;
    // }
    
    
}
