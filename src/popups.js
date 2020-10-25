import { fileToDataUrl, createElement, createPostImage, get_token, clear_content, create_update_table, create_table_row, create_comment_input } from './helpers.js';
import {link_profile} from './profile.js';
import API from "./api.js";
const api = new API();
const popup = document.getElementById('popup');
// const popup_content = document.getElementById('popup-content');
const popup_content = document.querySelector('.popup-content');

const setup_popup_alternate = (header) => {
        //create template for popup style
        popup.style.display = 'flex';
        // popup_content.style.flexDirection = 'column';
        // popup_content.style.alignItems = 'center';
        popup_content.className = 'popup-content-alternate';
        const exit_container = createElement('div', null, {class: 'exit-container'});
        exit_container.appendChild(createElement('h2', header , {class: 'popup-header-text'}))
        const exit_button = create_popup_exit();
        exit_container.appendChild(exit_button);
        popup_content.appendChild(exit_container);
}

const display_confirmation = (message) => {
    clear_content(popup_content);
    popup_content.appendChild(create_popup_exit());
    popup_content.appendChild(createElement('h1', message , {}));
} 

//todo add the reset button functionality -> wrap it in a form and call reset?
export function display_post_popup() {
    
    setup_popup_alternate('Make A Post');


    //exit button will be positioned outside of the div so we need to change the positioning style
    const image_container = createElement('div', null, {id: 'image-template'});
    popup_content.appendChild(image_container);
    
    
    let image_src = '';
    
    //add image area and description text area
    const upload_button = createElement('input', null, {id: 'upload-button', class: 'button-template', type: 'file'});
    upload_button.addEventListener('change', (event) => {
        const file = upload_button.files[0];
        fileToDataUrl(file)
        .then(data => {
            image_src = data.slice(23);
            const img_preview = createElement('img', null, {src: data, class: 'img-preview'});
            document.getElementById('image-template').appendChild(img_preview);
            document.getElementById('upload-button').style.display = 'none';
        });
    });
    
    
    image_container.appendChild(upload_button);
    const desc = createElement('textarea', null, {id: 'post-description', placeholder: 'Enter description', type: 'text'});
    popup_content.appendChild(desc);

    //add buttons
    const button_container = createElement('div', null, {id: 'post-buttons'});
    const reset_button = createElement('button', 'Reset', {class: 'button-template', id: 'post-reset'});
    const post_button = createElement('button', 'Post', {class: 'button-template', id: 'post'});
    
    button_container.appendChild(reset_button);
    button_container.appendChild(post_button);
    popup_content.appendChild(button_container);
    reset_button.addEventListener('click', () => {
        reset_post(reset_button);
    });
    
    post_button.addEventListener('click', () => {
        api.post(image_src, desc.value)
        .then(data => {
            if(data['message']) {
                popup_content.appendChild(createElement('p', `* ${data.message}`, {class: 'error-msg'}));
            } else {
                display_confirmation('Posted!');
            }
        })
    });

}



const reset_post = (reset_button) => {
    const image_container = document.getElementById('image-template')
    image_container.removeChild(image_container.lastChild);
    document.getElementById('upload-button').style.display = 'inline-block';
    reset_button.value = '';
}

const create_popup_exit = () => {

    let exit_button = createElement('button', 'X', {id:'popup-exit'});
        exit_button.addEventListener('click', () => {
            popup.style.display = 'none';
            clear_content(popup_content);
        });
    return exit_button;
}


const create_popup_content = (header, post) => {
    
    
    //depending on size of the device, set the correct style
    if (window.matchMedia("screen and (max-width: 500px)").matches) {
        popup_content.className = 'popup-content-alternate';
    } else {
        popup_content.className = 'popup-content';
    
    }
    
    
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

//creates a li for comments/likes popups
const create_list_item = (author, text) => {
    const li = createElement('li', '', {class: 'popup-list-item'});
    const comment_author = createElement('b', author, {class:'link-to-profile'});
    comment_author.appendChild(createElement('span', text,{class:'comment-text'}));
    comment_author.addEventListener('click', ()=>{
        link_profile(author);
    });
    li.appendChild(comment_author);
    return li;
}

export function setup_comment_popup(comment, post){
    
    //bit hack but get the post again to check for live updates
    comment.addEventListener('click', () => {
        api.get_post(post.id)
        .then(post => {    
            let popup_data_container = create_popup_content('Comments', post);
            //add all the comments
            const comments_list = createElement('ul', null, {id: 'comments-list'});
            post.comments.forEach((comment) => {
                comments_list.appendChild(create_list_item(comment.author, `: ${comment.comment}`));
            });
            popup_data_container.appendChild(comments_list);
            popup.style.display = 'block';
            
            popup_data_container.appendChild(create_comment_input(post.id));
        });
    });
    
    

}


export function setup_likes_popup(likes, post) {
    
    likes.addEventListener('click', (event) =>{
        api.get_post(post.id)
        .then(post => {
        //setup the eventlistener
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
            Promise.all(allPromises)
            .then(() => {
                for(let username of user_list){
                    likes_list.appendChild(create_list_item(username, ' likes this.'));
                }
            });   
            popup.style.display = 'block';
        });
        
    });
}

//TODO
//REFACTOR THIS AND POST CODE SO IT CALLS A FUNCTION TO CREATE THE POPUP CONTENT
//handle edge cases of editting (confirming empty description??)
export function setup_edit_popup(post_id) {
        
    setup_popup_alternate('Edit Post');

    //exit button will be positioned outside of the div so we need to change the positioning style
    const image_container = createElement('div', null, {id: 'image-template'});
    let image_src = '';
    api.get_post(post_id)
    .then(image => {
        image_src = image.src;
        image_container.appendChild(createElement('img', null, {src: "data:image/jpeg;base64,"+image.src , class: 'img-preview'}));
    });
    
    popup_content.appendChild(image_container);
    
    
    //description area
    const desc = createElement('textarea', null, {id: 'post-description', placeholder: 'Edit Description', type: 'text'});
    popup_content.appendChild(desc);
    //add buttons
    const button_container = createElement('div', null, {id: 'post-buttons'});
    const del = createElement('button', 'Delete', {class: 'button-template', id: 'post-delete'});
    const confirm = createElement('button', 'Confirm', {class: 'button-template', id: 'post-edit'});
    
    //delete the post
    del.addEventListener('click', (event) => {
        api.delete_post(post_id)
        .then(response => {
            if(response['message']) {
                popup_content.appendChild(createElement('p', `* ${response.message}`, {class: 'error-msg'}));
            } else {
                display_confirmation("Deleted Post!");
            }
        });
    });
    
    //confirm changes
    confirm.addEventListener('click', _ => {
        const new_desc = document.getElementById('post-description').value;
        const payload = { 'description_text': new_desc,
                            'src': image_src
        }
        api.edit_post(post_id, payload)
        .then(response => {
            if(response['message'] !== 'success') {
                popup_content.appendChild(createElement('p', `* ${response.message}`, {class: 'error-msg'}));
            } else {
                display_confirmation("Post updated!");
            }
        });
    });
    
    
    button_container.appendChild(del);
    button_container.appendChild(confirm);
    popup_content.appendChild(button_container);
    
}


//if onfocus with update password input,
//insertbefore update email an new input with confirm password
export function display_settings_popup() {
    
    //create template for popup style
    setup_popup_alternate('Update Profile');
    
    
    //create a form for user to update profile settings
    const settings = createElement('form', null, {id: 'settings-form'});
    const form = create_update_table();
    
    settings.appendChild(form);

    
    
    popup_content.appendChild(settings);
    
    const button_container = createElement('div', null, {id: 'post-buttons'});
    const cancel = createElement('button', 'Cancel', {class: 'button-template', id: 'update-cancel'});
    const confirm = createElement('button', 'Confirm', {class: 'button-template', id: 'update-confirm'});
    
    
    confirm.addEventListener('click', () => {
        update_profile();
    });
    
    button_container.appendChild(cancel);
    cancel.addEventListener('click', () => {
        popup.style.display = 'none';
        clear_content(popup_content);
    });
    
    button_container.appendChild(confirm);
    
    
    popup_content.appendChild(button_container);
    
    return settings;
}

const update_profile = () => {

    const new_email = document.getElementById('new-email').value;
    const new_name = document.getElementById('new-name').value;
    const new_pwd = document.getElementById('new-pwd').value;
    const verify_pwd = document.getElementById('verify-pwd').value;
    const curr_pwd = document.getElementById('pwd-confirm').value;
    
    
    
    let prof_info = {
        'email': new_email,
        'name': new_name,
        'password': new_pwd
    }
    
    //first get users current profile info
    api.get_user()
    .then(profile => {
        if(!prof_info['email']){
            prof_info['email'] = profile.email;
        }
        if(!prof_info['name']) {
            prof_info['name'] = profile.name;
        }
        return profile.username;
    })
    //then verify that the curr_pwd is correct
    .then(username => {
        return api.login_user(username, curr_pwd);
    })
    .then(response => {
        if(response.message) {
            popup_content.appendChild(createElement('span', '*Current Password is incorrect', {class: 'error-msg'}));
        } else if (new_pwd !== verify_pwd) {
            popup_content.appendChild(createElement('span', '*Passwords do not match', {class: 'error-msg'}));
        } else {
            localStorage.setItem('user_token', response.token);
            prof_info['password'] = curr_pwd;
            return true;
        }
        return false;
    })
    .then(flag => {
        if (flag) {
            console.log(prof_info);
            api.update_profile(prof_info)
            .then(response => {
                console.log(response);
                if(response['msg'] !== 'success') {
                    popup_content.appendChild(createElement('p', `* ${response.message}`, {class: 'error-msg'}));
                } else {
                    display_confirmation("Profile updated!");
                }
            });
        }
    });
    
}