import API from './api.js';
import { createElement, createPostTile, set_disabled_button, get_token, display_edit_popup } from './helpers.js';

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
    api.get_user_from_username(username, get_token())
    .then(data => {
        //setup the profile page
        set_profile_tags(data);
        set_following_list(data.following);
        display_profile_posts(data);
        follow_handler();
    });
    
}

//clears the profile page for it to be reused.
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
    
    //get the posts and make sure they're in order.
    const post_container = document.getElementById('profile-posts');
    const user_posts = profile.posts;
    user_posts.sort((first, second) => { return second - first});

    
    const options = {
        method: 'GET',  
        headers: { 'Authorization': get_token(), src: "data:image/jpeg;base64"}
    }
    
    //for each post that the user has made, create post tiles and append them to the page.
    user_posts.forEach((post_id) => {
        api.makeAPIRequest(`post/?id=${post_id}`, options)
        .then(data => {
            const tile = createPostTile(data);    
            const post_header = tile.childNodes[0];
            const edit_button = createElement('span', '\u2630', {class: 'edit-icon'});
            post_header.appendChild(edit_button);
            //if the viewing profile is the current user, the edit button will be visible.
            edit_button.addEventListener('click', () => {
                //display a popup that contains what they want to edit
                display_edit_popup(post_id);
            });
            
            post_container.appendChild(tile);
        })
    });
}

//handles follows
const follow_handler = () => {

    const follow_button = document.getElementById('follow-button');
    //from the userprofile extract the userse id
    const id = Number(id_number.innerText.slice(3));
    const options = {
        method: 'GET',
        headers: {'Content-Type': 'application/json', 'Authorization': get_token()}
    };
    
    //Check if the user of the profile that we are viewing, is the current user already following.
    api.get_user()
    .then(data => {
        //if we're already following, then set the button to unfollow and vice versa
        const following_ids = data.following;
        follow_button.innerText ="Follow";
        let following_request = "follow";
        if(following_ids.includes(id)) {
            follow_button.innerText = "Unfollow";
            following_request = "unfollow";
        }
        //handle the click of the follow/unfollow button
        options['method'] = 'PUT';
        follow_button.addEventListener('click', () => {
            api.makeAPIRequest(`user/${following_request}?username=${profile_username.innerText}`, options)
            .then(data => {
                if(data['message'] === 'success') {
                    follow_button.innerText = `${following_request}ed!`;
                    //display affirmation that the follow/unfollow was successful, then switch back to the button request text
                    setTimeout(()=> { 
                        following_request === 'follow' ? following_request = 'unfollow' : following_request = 'follow';
                        follow_button.innerText = following_request;
                        }, 1000);
                }
            });
        });

    });
}    

const set_following_list = (following_list) => {

    const following_dom = document.getElementById('following-list');
    let profiles = [];
    //wait until we recieve all of the usernames who user is following
    const allPromises = Array.from(Array(following_list.length)).map((_, i) => {
        return api.get_user_from_id(following_list[i], get_token())
        .then(user => {
            profiles.push(user.username);
        })
    });

    //once we have a complete list of usernames, create li's and append them to the list.
    Promise.all(allPromises)
    .then(() => {
        profiles.forEach(username => {
            let following_user = createElement('li', username, {class: 'comment-text', class: 'link-to-profile'});
            following_dom.appendChild(following_user);
            following_user.addEventListener('click', () => {
                link_profile(username);
            });
        });
    });

}

