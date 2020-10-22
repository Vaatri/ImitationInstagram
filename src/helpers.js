import API from "./api.js";
import { link_profile } from "./profile.js";

const api = new API();
/* returns an empty array of size max */
export const range = (max) => Array(max).fill(null);

/* returns a randomInteger */
export const randomInteger = (max = 1) => Math.floor(Math.random()*max);

/* returns a randomHexString */
const randomHex = () => randomInteger(256).toString(16);

/* returns a randomColor */
export const randomColor = () => '#'+range(3).map(randomHex).join('');

export const get_token = () => {
    return `Token ${localStorage.getItem('user_token')}`;
}

/**
 * You don't have to use this but it may or may not simplify element creation
 * 
 * @param {string}  tag     The HTML element desired
 * @param {any}     data    Any textContent, data associated with the element
 * @param {object}  options Any further HTML attributes specified
 */
export function createElement(tag, data, options = {}) {
    const el = document.createElement(tag);
    el.textContent = data;
   
    // Sets the attributes in the options object to the element
    return Object.entries(options).reduce(
        (element, [field, value]) => {
            element.setAttribute(field, value);
            return element;
        }, el);
}

/**
 * Given a post, return a tile with the relevant data
 * @param   {object}        post 
 * @returns {HTMLElement}
 */
export function createPostTile(post) {
    const section = createElement('section', null, { class: 'post' });
    
    //add author
    
    const post_author = createElement('h2', post.meta.author, { class: 'post-title' });
    post_author.addEventListener('click', () => {
        link_profile(post.meta.author);
    });

    section.appendChild(post_author);
    
    //create div for the content
    const content = createElement('div', null, {class: "content-container"});
    
    //add image
    content.appendChild(createPostImage(post));
    
    //add post content
    content.appendChild(createPostInfo(post));

    section.appendChild(content);
    
    return section;
}

const create_like_button = (id) => {
    const like_button_container = createElement('div', null, {});
    const like_button = createElement('button', 'Like this', {class: 'like-button', class: 'button-template'});
    like_button_container.appendChild(like_button);
    
    like_button.addEventListener('click', () => {
        const user_token = get_token();    
        api.get_request(`post/like/?id=${id}`, {method:'PUT', headers: { 
                                                                            'Content-Type': 'application/json', 
                                                                            'Authorization':  user_token }
                                                                            })
        .then(data => {
            console.log(data);
        })
    });
    
    return like_button_container;
}


/**
 * Create an image from the given post and return an image 
 * @param {*} post 
 */
export function createPostImage(post){

    //add image
    const img = createElement('img', null, 
        { src: "data:image/jpeg;base64,"+post.src, alt: post.meta.description_text, class: 'post-image' });
    
    
    return img;

}
/**
 * Create the post information, like, comments, description and return a div with all of it
 * @param {*} post 
 */
export function createPostInfo(post) {
    const post_data_container = createElement('div', null, {class: 'post-meta-container'});
    //create container for post meta data
    const post_data = createElement('div', null, {class: 'post-meta-data'})
    post_data_container.appendChild(post_data);
    
    //add a like button to the post
    post_data_container.appendChild(create_like_button(post.id));
    
    //add author description
    const author_text = createElement('b', `${post.meta.author}`, {class: 'author-desc' , class: 'link-to-profile'});
    post_data.appendChild(author_text);
    
    
    
    post_data.appendChild(createElement('span', `: ${post.meta.description_text}`, {class: 'desc-text'}));
    
    //add likes, comments and date
    const comments = createElement('p', `There are ${post.comments.length} comments`, {class : 'comments'});
    const likes = createElement('p', `${post.meta.likes.length} people like this`, {class : 'likes'});
    setup_comment_popup(comments, post);
    setup_likes_popup(likes, post);
    
    post_data.appendChild(likes);
    post_data.appendChild(comments);
    post_data.appendChild(createElement('p', `Published: ${convert_time(post.meta.published)}`, {class: "published"}));
    
    return post_data_container;
}

const popup = document.getElementById('popup');
const popup_content = document.getElementById('popup-content');

const create_popup_exit = () => {

    let exit_button = createElement('button', 'X', {id:'popup-exit'});
        exit_button.addEventListener('click', (event) => {
            popup.style.display = 'none';
            while(popup_content.hasChildNodes()){
                    popup_content.removeChild(popup_content.lastChild);
            }

        });
    return exit_button;
}

const create_popup_content = (header, post) => {
    //add the image
    popup_content.appendChild(createPostImage(post));
    //create a div with the header and exit button
    let popup_data_container = createElement('div', null, {class: 'popup-data-container'});
    popup_content.appendChild(popup_data_container);
    
    let header_exit_div = createElement('div',null, {class: 'popup-header'});
    header_exit_div.appendChild(createElement('h2', header, {class: 'popup-header-text'}));        
    header_exit_div.appendChild(create_popup_exit());
    popup_data_container.appendChild(header_exit_div);
    
    return popup_data_container;
}

export function setup_comment_popup(comment, post){
    
    comment.addEventListener('click', () => {
        popup_content.style.flexDirection = 'row';
        popup_content.style.alignItems = 'stretch';
        let popup_data_container = create_popup_content('Comments', post);
        //add all the comments
        const comments_list = createElement('ul', null, {id: 'comments-list'});
        post.comments.forEach((comment) => {
            const li = createElement('li', '', {class: 'popup-list-item'});
            const comment_author = createElement('b', `${comment.author}`, {class:'link-to-profile'});
            comment_author.appendChild(createElement('span',`: ${comment.comment}`,{class:'comment-text'}));
            comment_author.addEventListener('click', ()=>{
                link_profile(comment.author);
            });
            
            comments_list.appendChild(li);
            li.appendChild(comment_author);
        });
        popup_data_container.appendChild(comments_list);
        popup.style.display = 'block';
        //create the comments list
    
    });
    

}


function setup_likes_popup(likes, post) {

    //setup the eventlistener
    likes.addEventListener('click', (event) =>{
        popup_content.style.flexDirection = 'row';
        popup_content.style.alignItems = 'stretch';
        let popup_data_container = create_popup_content('Likes', post);
        const likes_list = createElement('ul', null, {id: 'likes-list'});
        popup_data_container.appendChild(likes_list);
        const token = get_token();
        
        let user_list = [];
        
        const allPromises = Array.from(Array(post.meta.likes.length)).map((_, i) => {       
            return api.get_user_from_id(post.meta.likes[i], token)
            .then(user => {
                user_list.push(user.username); 
            });
        });
        console.log(allPromises);
        
        Promise.all(allPromises)
        .then(() => {
            console.log(user_list);
            for(let username of user_list){
                const li = createElement('li', '', {class: 'popup-list-item'});
                const comment_author = createElement('b', username, {class:'link-to-profile'});
                comment_author.addEventListener('change', ()=>{
                    link_profile(username);
                });
                li.appendChild(comment_author);
                li.appendChild(createElement('span',` likes this.`,{class: 'comment-text'}));
                likes_list.appendChild(li);
            }
        });   
        popup.style.display = 'block';
    });
    
}


function convert_time(published_time) {
    
    var d=new Date(); 
    var now_time = Math.floor(d.getTime()/1000);
    var seconds = now_time-published_time;

    if (seconds > 24*3600) {
        const days = Math.floor(seconds/(24*3600));
       return `Posted ${days} ago`;
    }

    if (seconds > 3600) {
        const hours = seconds/3600
       return `Posted ${hours} ago`;
    }

    if (seconds > 60) {
       return Math.floor(seconds/60) + " minutes ago";
    }
}



/* 
    Reminder about localStorage
    window.localStorage.setItem('AUTH_KEY', someKey);
    window.localStorage.getItem('AUTH_KEY');
    localStorage.clear()
*/
export function checkStore(key) {
    if (window.localStorage)
        return window.localStorage.getItem(key)
    else
        return null
}

export function set_disabled_button(button, text) {
    // button.setAttribute("disabled", true);
    button.textContent = text;
    button.style.background = 'linear-gradient(90deg, rgba(171,167,241,1) 0%, rgba(183,183,233,1) 30%, rgba(205,234,240,1) 100%)';
    button.style.color = 'white';
    button.style.fontWeight = 'bold';
    
}

export function display_post_popup() {
    popup.style.display = 'flex';
    //this popup is different to the comments/likes popup so we need to change the way its made
    popup_content.style.flexDirection = 'column';

    popup_content.style.alignItems = 'center';
    const exit_container = createElement('div', null, {class: 'exit-container'});
    exit_container.appendChild(createElement('h2', 'New Post', {class: 'popup-header-text'}))
    const exit_button = create_popup_exit();
    exit_container.appendChild(exit_button);
    popup_content.appendChild(exit_container);
    
    //exit button will be positioned outside of the div so we need to change the positioning style

    const image_container = createElement('div', null, {id: 'image-template'});
    popup_content.appendChild(image_container);
    
    //add image area and description text area
    const upload_button = createElement('input', null, {id: 'upload-button', class: 'button-template', type: 'file'});
    upload_button.addEventListener('change', (event) => {
        const file = upload_button.files[0];
        fileToDataUrl(file)
        .then(data => {
            console.log(data);
            const image_src = data.slice(38);
            const img_preview = createElement('img', null, {src: data});
            document.getElementById('image-template').appendChild(img_preview);
        });
    });
    image_container.appendChild(upload_button);
    const desc = createElement('textarea', null, {id: 'post-description', placeholder: 'Enter description', cols: 45});
    popup_content.appendChild(desc);

    //add buttons
    const button_container = createElement('div', null, {id: 'post-buttons'});
    const reset_button = createElement('button', 'Reset', {class: 'button-template'});
    const post_button = createElement('button', 'Post', {class: 'button-template'});
    button_container.appendChild(reset_button);
    button_container.appendChild(post_button);
    popup_content.appendChild(button_container);

}

// Given an input element of type=file, grab the data uploaded for use
export function uploadImage(event) {
    const [ file ] = event.target.files;

    console.log(file);
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);

    // bad data, let's walk away
    if (!valid)
        return false;
    
    // if we get here we have a valid image
    const reader = new FileReader();
    
    reader.onload = (e) => {
        // do something with the data result
        const dataURL = e.target.result;
        const image = createElement('img', null, { src: dataURL });

        document.body.appendChild(image);
    };

    // this returns a base64 image
    reader.readAsDataURL(file);
}

/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }
    
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
}
