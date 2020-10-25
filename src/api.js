import {get_token, clear_content} from './helpers.js';

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
    
    login_user(username, pwd) {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({'username': username, 'password': pwd})
        }
        
        return this.makeAPIRequest('auth/login', options);
    }
    
    get_feed(p) {
        const options = {
            method: 'GET',  
            headers: { 'Authorization': get_token(), src: "data:image/jpeg;base64" }
        }
        return this.makeAPIRequest(`user/feed?p=${p}`, options)
    }
    
    get_user() {
        const options = {
            method: 'GET',
            headers: {'Content-Type': 'application/json', 'Authorization': get_token()}
        };
        
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
    
    post(image, description) {
        const payload = { 'description_text': description ,
                        'src': image
        };
        
        const options = { 
                        method: 'POST', 
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': get_token()    
                                },
                        body: JSON.stringify(payload)
        };
        
        return this.makeAPIRequest('post/', options);
    }
    
    get_post(id) {
        const options = { method: 'GET',  
                        headers: { 'Authorization': get_token() , src: "data:image/jpeg;base64"}
                        };
        return this.makeAPIRequest(`post/?id=${id}`, options)     ;
    }
    
    edit_post(id, payload) {
        const options = { method: 'PUT',
                          headers: { 'Authorization': get_token() ,'Content-Type': 'application/json'},
                          body: JSON.stringify(payload)
                        }
    
        return this.makeAPIRequest(`post/?id=${id}`, options);
    }
    
    delete_post(id) {
        const options = { method: 'DELETE', headers: { 'Authorization': get_token()}}
        return this.makeAPIRequest(`post/?id=${id}`, options);
    }
    
    post_comment(id, comment) {
        const options = { method: 'PUT',
                          headers: { 'Authorization': get_token() ,'Content-Type': 'application/json'},
                          body: JSON.stringify({'comment': comment})
                        }
        return this.makeAPIRequest(`post/comment?id=${id}`, options);                
    }
    
    update_profile(payload) {
        const options = {
            method: 'PUT',
            headers: { 'Authorization': get_token() ,'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        };
        return this.makeAPIRequest(`user/`, options);
    }
}
