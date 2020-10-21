import API from './api.js';
import { createElement, createPostTile, set_disabled_button } from './helpers.js';

const api = new API();


const profile_username = document.getElementById('profile-username');
const id_number = document.getElementById('id-number');
//this will be an event listener to clicking usernames on posts
export function link_profile(username) {
    
    
    //clean up the feed
    const feed_dom = document.getElementById("feed");
    feed_dom.style.display = 'none';
    document.getElementById('popup').style.display = 'none';
    clear_profile_page();
    const header_banner = document.getElementById('banner');
    header_banner.style.Height = '50px';
    
    
    //display the page
    document.getElementById('profile-page').style.display = 'flex';
    const token = localStorage.getItem('token');
    //get user info
    api.get_user_from_username(username, `Token ${localStorage.getItem('user_token')}`)
    .then(data => {
        set_profile_tags(data);
        display_profile_posts(data);
        follow_handler();
    });
    
}

const clear_profile_page = () => {
    const posts = document.getElementById('profile-posts');
    
    //remove previous profiles info
    if(document.getElementById('profile-username').textContent !== ''){
        document.getElementById('followers').remove();
        document.getElementById('following').remove();
        let profile_info = document.querySelectorAll('.prof-info');
        profile_info[0].remove();
        profile_info[1].remove();
    }
    
    while(posts.hasChildNodes()){
        posts.removeChild(posts.lastChild);
    }
}

//set all of the relative tags to display the correct info
const set_profile_tags = (info) => {
    const follower_container = document.getElementById('followers-container');
    const profile_info = document.getElementById('profile-info');
    profile_username.innerText = info.username;
    id_number.innerText = `ID ${info.id}`;
    
    //add followers/following content
    const followers_elem = createElement('span', `Followers ${info.followed_num}`, {id: 'followers'});
    const following_elem = createElement('span', `Following ${info.following.length}`, {id: 'following'});
    follower_container.appendChild(followers_elem);
    follower_container.appendChild(following_elem);
    //add user profile info
    profile_info.appendChild(createElement('span', `${info.name}, `, {class: 'prof-info'}));
    profile_info.appendChild(createElement('span', `${info.email}`, {class: 'prof-info'}));
}

const display_profile_posts = (profile) => {
    
    const post_container = document.getElementById('profile-posts');
    const user_posts = profile.posts;

    user_posts.sort((first, second) => { return second - first});
    
    const options = {
        method: 'GET',  
        headers: { 'Authorization': `Token ${localStorage.getItem('user_token')}`, src: "data:image/jpeg;base64"}
    }
    
    user_posts.forEach((post_id) => {
        api.makeAPIRequest(`post/?id=${post_id}`, options)
        .then(data => {
            // console.log(data);
            const tile = createPostTile(data);
            post_container.appendChild(tile);
        })
    });
}

const follow_handler = () => {
    const follow_button = document.getElementById('follow-button');
    const id = Number(id_number.innerText.slice(3));
    // follow_button.setAttribute("disabled", false);
    const options = {
        method: 'GET',
        headers: {'Content-Type': 'application/json', 'Authorization': `Token ${localStorage.getItem('user_token')}`}
    };
    
    api.get_user(localStorage.getItem('user_token'), options)
    .then(data => {
        const following_ids = data.following;
        follow_button.innerText ="Follow";
        let following_request = "follow";
        if(following_ids.includes(id)) {
            follow_button.innerText = "Unfollow";
            following_request = "unfollow";
        }
        options['method'] = 'PUT';
        follow_button.addEventListener('click', () => {
            api.makeAPIRequest(`user/${following_request}?username=${profile_username.innerText}`, options)
            .then(data => {
                if(!data['message']) {
                    set_disabled_button(follow_button, `${following_request}ed!`);
                } else {
                    follow_button.innerText = "Can't Follow yourself bro";
                }
            });
        });

    });
}    


const is_following = () => {
    //get the id of the current user id
    const id = id_number.innerText.slice(3);
    console.log(id);
    //we need to check if current user is already following
    api.get_user(localStorage.getItem('user_token'))
    .then(data => {
        
    });
}