import API from "./api.js";
import { link_profile } from "./profile.js";
import { display_post_popup, setup_comment_popup, setup_edit_popup, setup_likes_popup } from "./popups.js";

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
    
    //add
    const post_header = createElement('div', null, {class: 'post-header-container'});
    const post_author = createElement('h2', post.meta.author, { class: 'post-title' });
    // const edit_post = createElement('h2', '\u2630', {class: 'edit-icon-feed'});
    
    post_header.appendChild(post_author);
    // post_header.appendChild(edit_post);
    
    post_author.addEventListener('click', () => {
        link_profile(post.meta.author);
    });

    section.appendChild(post_header);
    
    //create div for the content
    const content = createElement('div', null, {class: "content-container"});
    
    //add image
    content.appendChild(createPostImage(post));
    
    //add post content
    content.appendChild(createPostInfo(post));

    section.appendChild(content);
    
    return section;
}

//function that returns a bool whether if the post is liked by the current user
const check_liked = (post) => {        
    return api.get_user()
    .then(user => {
        return post.meta.likes.includes(user.id);
    })

    
}


//create a like button and add its functionality
const create_like_button = (id) => {

    //create the button and set up event listeners
    const like_button_container = createElement('div', null, {});
    const like_button = createElement('button');
    like_button_container.appendChild(like_button);
    
    return like_button_container;
}

//sorry in advance for this spaghetti
const set_like_button = (button,post) => {
        //This is the initial check if the post is liked or not
        check_liked(post)
        .then(isLiked => {
            //set the appropriate style of the button
            let text = 'Like this';
            button.className = 'like-button button-template';
            if(isLiked) {
                text = 'Liked!'
                button.className =  'like-button button-template liked-button';
            }
            button.textContent = text;
            //Now handle the click functionality and change of style/text 
            button.addEventListener('click', () => {
                let path = 'like'
                if(button.textContent === 'Liked!') {
                    path = 'unlike';
                }
                console.log(path);
                //then actually call the api to send the like/unlike
                const user_token = get_token();  
                api.get_request(`post/${path}/?id=${post.id}`, {method:'PUT', headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization':  user_token }
                })
                //then get the post so we can update the likes
                .then(() => {
                    if(path === 'like') {
                        button.textContent = 'Liked!';
                        button.className =  'like-button button-template liked-button';
                    } else {
                        button.textContent = 'Like this';
                        button.className = 'like-button button-template';
                    }
                    return api.get_post(post.id);
                })
                .then(post => {
                    document.getElementById(`likes-count-${post.id}`).textContent = `${post.meta.likes.length} people like this`;
                });
                
            })
        });
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
    //add likes, comments and date
    const comments = createElement('p', `${post.comments.length} Comments`, {class : 'comments', id: `comments-count-${post.id}`});
    const likes = createElement('p', `${post.meta.likes.length} Likes`, {class : 'likes', id: `likes-count-${post.id}`});
    
    setup_comment_popup(comments, post);
    setup_likes_popup(likes, post);
    
    const likes_comments_container = createElement('div', null, {class:'likes-comments-container'});
    likes_comments_container.appendChild(likes);
    likes_comments_container.appendChild(comments);
    post_data.appendChild(likes_comments_container);
    
    //add author description
    const author_text = createElement('b', `${post.meta.author}`, {class: 'author-desc' , class: 'link-to-profile'});
    post_data.appendChild(author_text);
    
    post_data.appendChild(createElement('span', `: ${post.meta.description_text}`, {class: 'desc-text'}));
    
    
    // const likes_comments_container = createElement('div', null, {class:'likes-comments-container'});
    // likes_comments_container.appendChild(likes);
    // likes_comments_container.appendChild(comments);
    post_data.appendChild(createElement('p', `${convert_time(post.meta.published)}`, {class: "published"}));
    
    //add a like button to the post
    const like_button = create_like_button(post.id);
    set_like_button(like_button, post);
    post_data_container.appendChild(like_button);
    post_data_container.appendChild(create_comment_input(post.id));
    
    return post_data_container;
}

export const create_comment_input = (id) => {
    const comment_container = createElement('div', null, {class: 'post-comments'});
    const comment_box = createElement('textarea', null, {placeholder: 'Write a comment...', class: 'comment-box'});
    const comment_button = createElement('button', 'Post', {class: 'post-comment-button'});
    comment_button.addEventListener('click', _ => {
        const comment = comment_box.value;
        api.post_comment(id, comment)
        .then((data) => {
 
            comment_button.textContent = "Posted!";
            comment_box.value = '';
            setTimeout(() => {comment_button.textContent = "Post"}, 1500);
            return api.get_post(id);
        })
        //this should give a live update of the comments count.
        .then((post) => {
            document.getElementById(`comments-count-${id}`).textContent = `${post.comments.length} people have commented`;
        });
    });
    
    comment_container.appendChild(comment_box);
    comment_container.appendChild(comment_button);
    
    return comment_container;
}

export function convert_time(published_time) {
    
    var d=new Date(); 
    var now_time = Math.floor(d.getTime()/1000);
    var seconds = now_time-published_time;

    if (seconds > 24*3600) {
        const days = Math.floor(seconds/(24*3600));
       return `Posted ${Math.trunc(days)} days ago`;
    }

    if (seconds > 3600) {
        const hours = seconds/3600
       return `Posted ${Math.trunc(hours)} hours ago`;
    }

    if (seconds > 60) {
       return `Posted ${Math.trunc(Math.floor(seconds/60))} minutes ago`;
    }
}

export function clear_content(container) {
    while(container.hasChildNodes()){
        container.removeChild(container.lastChild);
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

export function display_edit_popup(id) {
    setup_edit_popup(id);
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


export function create_update_table () {
    const table = createElement('table', null, {id: 'update-table'});
    table.appendChild(create_table_row('text', 'New Name', 'new-name', 'Leave blank if unchanged'));
    table.appendChild(create_table_row('password','New Password', 'new-pwd', 'Leave blank if unchanged'));
    table.appendChild(create_table_row('password','Verify Password', 'verify-pwd', 'Leave blank if unchanged'));
    table.appendChild(create_table_row('text', 'New Email', 'new-email', 'Leave blank if unchanged'));
    table.appendChild(create_table_row('password','Current Password', 'pwd-confirm', ''));    
    return table;
}

export function create_table_row (type, heading, id, placeholder) {

    const row = createElement('tr', null, {});
    row.appendChild(createElement('td', heading));
    const input = createElement('input', null, {type: type, id: id, placeholder: placeholder});
    const cell = createElement('td', null, {});
    cell.appendChild(input);
    row.appendChild(cell);

    return row;
}

export function throttle(fn, wait) {
    let time = Date.now();
    return () => {
        if((time + wait - Date.now()) < 0) {
            fn();
            time = Date.now();
        }
    }
}

export function create_suggestion_item(name) {
    const li = createElement('li', name, {class: 'popup-list-item', class:'link-to-profile'});
    return li;
}