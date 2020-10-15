
// importing named exports we use brackets
import { createElement, createPostTile, uploadImage } from './helpers.js';

// when importing 'default' exports, use below syntax
import API from './api.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

// const api  = new API();

// // we can use this single api request multiple times
// const feed = api.getFeed();

// feed
// .then(posts => {
//     posts.reduce((parent, post) => {

//         parent.appendChild(createPostTile(post));
        
//         return parent;

//     }, document.getElementById('large-feed'))
// });

// // Potential example to upload an image
// const input = document.querySelector('input[type="file"]');

// input.addEventListener('change', uploadImage);

const background_gradient = 'linear-gradient(90deg, rgba(171,167,241,1) 0%, rgba(183,183,233,1) 30%, rgba(205,234,240,1) 100%)';

// begin my code
const form_page = document.getElementById('form-container');
const login_form = document.forms.login_register_form;
const page = document.getElementById('page');
const form_header = document.getElementById("form-header");
const form = document.getElementById('form');

const api = new API();

form.addEventListener('submit', (event) => {
    
    event.preventDefault();
    
    
    const username = login_form.elements.username.value;
    const pwd = login_form.elements.pwd.value;
    
    let options;    
    let path;
    
    if(login_form.length === 4){
        const user_details = { username: username, password:pwd };
        options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user_details)
        }
        path = 'auth/login';
        
    } else {
    
        const email = login_form.elements.email.value;
        const name = login_form.elements.name.value;
        const pwd_confirm = login_form.elements.pwd_confirm.value;
        
        const reg_details = { 
            username: username,
            password: pwd,
            email: email,
            name: name
        }
        
        if(!is_valid_password(pwd, pwd_confirm)){
            alert("Passwords don't match");
            return;
        }
        if(!is_valid_email(email)) {
            alert("Please enter a valid email");
            return;
        }
        
        options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reg_details)
        };
        path = 'auth/signup';
    }
    
    
    
        api.makeAPIRequest(path, options)
        .then(response => {
            if(response["message"]) {
            
                alert(response.message);
            //otherwise save data in localstorage
            } else {
                const token = response.token;
                localStorage.setItem('user_token', token);
                display_feed(token);
            }
        });


});

const is_valid_email = (email) => {
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
}

const is_valid_password = (pwd, pwd_confirm) => {
    return pwd === pwd_confirm;
}


const feed_dom = document.getElementById("feed");

const display_feed = (token) => {

    const header = document.getElementById("banner");
    const footer = document.getElementById("footer");
    
    header.style.background = background_gradient;
    header.style.borderBottom = '1px solid rgb(199, 199, 199)';
    footer.style.background = background_gradient;
    
    form_page.style.display = 'none';

    const options = {
        method: 'GET',  
        headers: { 'Authorization': 'Token ' +token, src: "data:image/jpeg;base64" }
    }
    
    // const feed_dom = document.getElementById("feed");
    feed_dom.style.display = 'flex'; 
    
    api.get_request('user/feed', options)
    .then(data => {
        console.log(data);
        const posts = data.posts;
        posts.reduce((parent, post, post_index) => {
                    
                    // const post_template = createPostTile(post, post_index);
                    
                    parent.appendChild(createPostTile(post, post_index));
                    return parent;
        }, feed_dom)
    })
    
}

const create_pagination = (post) => {

    const button_container = createElement('div', null, {id: 'pagination-container'});
    feed_dom.appendChild(button_container);
    
    
}

const display_register_form = () => {

    form_header.innerText = "REGISTER";
    
    const create_attributes = (ph, t, n) => {
        return {placeholder: ph, type: t, name: n};
    }
    
    const confirm_attr = create_attributes("Confirm password", 'password', 'pwd_confirm');
    const email_attr = create_attributes("Enter Email", "text", "email");
    const name_attr = create_attributes("Enter your full name", "text", "name");
    const placement = document.getElementById("buttons-container");
    const input_cont = document.getElementById("input-container");
    
    input_cont.insertBefore(createElement('input', '', confirm_attr), placement);
    input_cont.insertBefore(createElement('input', '', email_attr), placement);
    input_cont.insertBefore(createElement('input', '', name_attr), placement);
    
    login_form.elements.secondary.value = "Login";
    
}

const display_login_form = () => {
    
    form_header.innerText = "LOGIN";
    login_form.elements.pwd_confirm.remove();
    login_form.elements.email.remove();
    login_form.elements.name.remove();
    login_form.elements.secondary.value = "Register";
    
}


login_form.elements.secondary.addEventListener('click', (event) => {
    if(login_form.elements.secondary.value === 'Register') {
        display_register_form();
    } else {
        display_login_form();
    }

});

// const setup_posts = () => {



// }

const setup_comments = () => {
    const modal = document.getElementById()
    const comments = document.querySelectorAll('.comments');
    comments.forEach((comment) => {
        comment.addEventListener('click', (e) => {
            
            
            modal.style.display = 'block';
        });
    });

}



// Example usage of makeAPIRequest method.
api.makeAPIRequest('dummy/user')
    .then(r => console.log(r));