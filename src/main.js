// importing named exports we use brackets
import { createElement, createPostTile, create_suggestion_item, get_token } from './helpers.js';
import {link_profile} from './profile.js';
import {display_post_popup, display_settings_popup} from './popups.js';
// when importing 'default' exports, use below syntax
import API from './api.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';


const background_gradient = 'linear-gradient(90deg, rgba(171,167,241,1) 0%, rgba(183,183,233,1) 30%, rgba(205,234,240,1) 100%)';

//page doms
const feed_dom = document.getElementById("feed");
const page = document.getElementById('page');
const form = document.getElementById('form');
const form_page = document.getElementById('form-container');
const header = document.getElementById("banner");
const footer = document.getElementById("footer");
const profile_page = document.getElementById('profile-page');

//nav bar doms
const logout_button = document.getElementById('logout');
const create_post = document.getElementById('nav-post');
const user_profile = document.getElementById('nav-profile');
const settings = document.getElementById('settings-icon');
const nav_feed = document.getElementById('nav-feed');



//misc doms
const login_form = document.forms.login_register_form;
const form_header = document.getElementById("form-header");

let num_posts = 0;

const api = new API();

//debug
console.log(get_token());

//nav bar events
logout_button.addEventListener('click', () => {
    localStorage.clear();
    feed_dom.style.display = 'none';
    profile_page.style.display = 'none';
    form_page.style.display = 'flex';
    document.getElementById('nav-bar').style.display = 'none';
    while(feed_dom.hasChildNodes()) {
        feed_dom.removeChild(feed_dom.lastChild);
    }
    footer.style.background = '#e6e6e6';
    header.style.background = '#e6e6e6';
});


settings.addEventListener('click', () => {
    display_settings_popup();
});


user_profile.addEventListener('click', () => {
    link_profile(localStorage.getItem('username')); 
});


nav_feed.addEventListener('click', () => {
    display_feed();
})


//if user refreshes display the feed or if logged out then display user form
window.onload = () => {
    const token = localStorage.getItem('user_token');
    if(token){
        display_feed(token);
    } else {
        document.getElementById('nav-bar').style.display = 'none';
    }
}

//initial form submit
form.addEventListener('submit', (event) => {
    
    event.preventDefault();
    
    const username = login_form.elements.username.value;
    const pwd = login_form.elements.pwd.value;
    
    let options;    
    let path;
    
    //check whether its the registration form or login
    //condition could be more elegant but it works c:
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
    
    //by calling makeAPIRequest, we only have to handle one api call, rather than two
    api.makeAPIRequest(path, options)
    .then(response => {
        if(response["message"]) {
            alert(response.message);
        //otherwise save data in localstorage
        } else {
            const token = response.token;
            localStorage.setItem('user_token', token);
            localStorage.setItem('username', username);
            set_notifications();
            // console.log(token);
            display_feed(token);
        }
    });


});

//some regex to see if its a valid email
const is_valid_email = (email) => {
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
}

//check if its a valid password lol
const is_valid_password = (pwd, pwd_confirm) => {
    return pwd === pwd_confirm;
}

//this function displays the feed in the page
const feed = () => {
    //call the api to get the posts starting at num_posts
    api.get_feed(num_posts)
    .then(data => {
        const posts = data.posts;
        //using the feed_dom as the initial value, append post tiles to it.
        posts.reduce((parent, post) => {
            //used for notifications, store the highest id of the post
            let highest_post = localStorage.getItem('highest_post');
            if(!highest_post) {
                localStorage.setItem('highest_post', post.id);
            } else if (highest_post < post.id) {
                localStorage.setItem('highest_post', post.id);
            }
            //createPostTile will handle all of the creation of the post, including buttons, modals, etc.
            const post_content = createPostTile(post)  
            parent.appendChild(post_content);
            num_posts++;
            return parent;
        }, feed_dom)
    })
    .then(() => {
        //this will create links to profiles presented in the posts.
        link_profiles();
        //if the user is new, num_posts should still be 0
        if(num_posts === 0) {
            display_suggested_following();
        } else {
            if(document.getElementById('suggestions-container')){
                document.getElementById('suggestions-container').remove(); 
            }
            if(document.getElementById('intro')) {
                document.getElementById('intro').remove();
            }
        }
    });
}

//display some users for a user that just registered and isn't following anyone
const display_suggested_following = () => {
    //Create a page with a header, and a suggestions box for the user
    feed_dom.appendChild(createElement('h1', 'Welcome to Quickpic!, here are some suggestions on who to follow!', {style: 'margin: 1em', id: 'intro'}));
    const suggestions_container = createElement('div', null, {id: 'suggestions-container'});
    const suggestion_list = createElement('ul', 'Click on their usernames to view their profiles!', {id: 'suggestion-list'})
    suggestion_list.appendChild(createElement('hr', null, {}));
    suggestions_container.appendChild(suggestion_list);
    //this will create a li with the username, a link to their profile, and a follow button
    suggestion_list.appendChild(create_suggestion_item('Andrew'));
    suggestion_list.appendChild(create_suggestion_item('Ava'));
    suggestion_list.appendChild(create_suggestion_item('Sarah'));
    suggestion_list.appendChild(create_suggestion_item('Matthew'));
    suggestion_list.appendChild(create_suggestion_item('Jack'));
    suggestion_list.appendChild(create_suggestion_item('Harper'));
    suggestion_list.appendChild(create_suggestion_item('Zoe'));
    suggestion_list.appendChild(create_suggestion_item('Amelia'));
    feed_dom.appendChild(suggestions_container);
    link_profiles();
    
}

//display the feed
const display_feed = (token) => {
    //keeps count of how many posts have been displayed in the feed
    num_posts = 0;

    //change the header/footer css to make it more kawaii
    header.style.background = background_gradient;
    header.style.borderBottom = '1px solid rgb(199, 199, 199)';
    
    window.matchMedia("screen and (max-width: 500px)").matches ? header.style.height = '30px': header.style.height = '50px'; 
    footer.style.background = background_gradient;
    
    //set up the feed
    form_page.style.display = 'none';
    profile_page.style.display = 'none';
    document.getElementById('nav-bar').style.display = 'inline';    
    feed_dom.style.display = 'flex'; 
    feed();
    
}

//searches all elements that have link-to-profile class, and make it link to users profile
const link_profiles = () => {
    const profile_links = document.querySelectorAll('.link-to-profile');
    profile_links.forEach((element) => {
        element.addEventListener('click', () => {
            link_profile(element.textContent);
        });
    })
}


//adds elements so user can register.
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

//removes the elements used by register and changes the button value
const display_login_form = () => {
    form_header.innerText = "LOGIN";
    login_form.elements.pwd_confirm.remove();
    login_form.elements.email.remove();
    login_form.elements.name.remove();
    login_form.elements.secondary.value = "Register";
    
}


//Depending on what the form is, display the correct button
login_form.elements.secondary.addEventListener('click', (event) => {
    if(login_form.elements.secondary.value === 'Register') {
        display_register_form();
    } else {
        display_login_form();
    }

});

//add create post functionality
create_post.addEventListener('click', () => {
    display_post_popup();
});



// //infinite scroll baby
//wait is used to throttle the scroll input
let wait = false;
document.addEventListener('scroll', () => {
    let window_pos = window.scrollY;
    //if it passes this threshold then display the next amount of posts.
    if(window_pos > (document.body.scrollHeight - 1000) && wait === false) {
        feed();
        wait = true;
        //timer is currently set to half a second.
        setTimeout(() => { wait = false}, 500);
    }

});


const check_latest_posts = () => {
    console.log('hello');
    api.get_feed(0)
    .then(feed => {
        console.log(feed);
        feed.posts.forEach((post => {
            if(post.id > localStorage.getItem('highest_post')) {
                send_notification(post);
            }
        }));
    })
}

const send_notification = (post) => {
    
    if(Notification.permission === "granted") {
        var notification = new Notification(`${post.author} just posted!`);
    }

}


const set_notifications = () => {
    
    api.get_feed(0)
    .then(feed => {
        feed.posts.forEach(post => {
            let highest_post = localStorage.getItem('highest_post');
            if(!highest_post) {
                localStorage.setItem('highest_post', post.id);
            } else if (highest_post < post.id) {
                localStorage.setItem('highest_post', post.id);
            }
        });
    })
    .then(() => {    
        Notification.requestPermission().then(permission => {
        });
        // setInterval(() => {check_latest_posts()}, 1000);
    })
    

}





