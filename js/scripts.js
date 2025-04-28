// =========================
// Member Sign-up Handling
// =========================
document.getElementById("membership-form")?.addEventListener("submit", function(event) {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("reason-for-joining").value;

    fetch('http://localhost:3000/member-signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, message }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        alert('Sign-up successful!');
        window.location.href = 'membership-success.html';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});

// =========================
// E-board Sign Up Handling
// =========================
const signupForm = document.getElementById("signup-form");
if (signupForm) {
    signupForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        fetch('http://localhost:3000/signup', {
            method: 'POST',
            body: JSON.stringify({ username, email, password, role }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            alert('You are all signed up!');
            window.location.href = 'login.html';
        })
        .catch(error => console.error('Error:', error));
    });
}

// =========================
// Check login status
// =========================
document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("token");
    const loginLink = document.getElementById("login-link");

    if (loginLink) {
        if (token) {
            loginLink.textContent = "Logout";
            loginLink.href = "logout.html";
        } else {
            loginLink.textContent = "E-board Login";
            loginLink.href = "login.html";
        }
    }
});

// =========================
// Handle Login
// =========================
document.getElementById("login-form")?.addEventListener("submit", function(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch('http://localhost:3000/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username);
            window.location.href = 'dashboard.html';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// =========================
// Restrict E-board Pages
// =========================
document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("token");

    if (window.location.pathname.includes("dashboard.html") || 
        window.location.pathname.includes("edit-events.html") || 
        window.location.pathname.includes("members.html")) {
        if (!token) {
            window.location.href = "login.html";
        }
    }
});

// =========================
// Logout
// =========================
document.querySelector('a[href="logout.html"]')?.addEventListener('click', function(event) {
    event.preventDefault();
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

// =========================
// Public Events List (events.html)
// =========================
document.addEventListener("DOMContentLoaded", function() {
    const eventsList = document.getElementById("events-list");
    if (eventsList) {
        fetch('http://localhost:3000/events', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            data.forEach(event => {
                const eventElement = document.createElement("div");
                eventElement.innerHTML = `
                    <h3>${event.event_name}</h3>
                    <p><strong>Date:</strong> ${new Date(event.event_date).toLocaleString()}</p>
                    <p><strong>Location:</strong> ${event.event_location}</p>
                    <p><strong>Description:</strong> ${event.event_description}</p>
                `;
                eventsList.appendChild(eventElement);
            });
        })
        .catch(error => console.error('Error fetching events:', error));
    }
});

// =========================
// Handle Event Creation (edit-events.html)
// =========================
document.getElementById("edit-event-form")?.addEventListener("submit", function(event) {
    event.preventDefault();

    const eventName = document.getElementById("event-name").value;
    const eventDate = document.getElementById("event-date").value;
    const eventLocation = document.getElementById("event-location").value;
    const eventDescription = document.getElementById("event-description").value;

    const token = localStorage.getItem("token");

    if (token) {
        fetch('http://localhost:3000/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({
                event_name: eventName,
                event_date: eventDate,
                event_location: eventLocation,
                event_description: eventDescription
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert('Event added successfully!');

                document.getElementById("edit-event-form").reset();
                window.history.replaceState({}, document.title, window.location.pathname);
                loadAdminEvents();
            } else {
                alert('Error adding event.');
            }
        })
        .catch(error => console.error('Error adding event:', error));
    } else {
        alert('You must be logged in to add events!');
    }
});

// =========================
// Admin Events List (edit-events.html)
// =========================
document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("jsa-event-list")) {
        loadAdminEvents();
    }
});

function loadAdminEvents() {
    const token = localStorage.getItem("token");

    fetch('http://localhost:3000/events', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
    .then(response => response.json())
    .then(data => {
        const eventList = document.getElementById("jsa-event-list");
        eventList.innerHTML = "";

        data.forEach(event => {
            const eventElement = document.createElement("div");
            eventElement.style.marginBottom = "20px";
            eventElement.innerHTML = `
                <h3>${event.event_name}</h3>
                <p><strong>Date:</strong> ${new Date(event.event_date).toLocaleString()}</p>
                <p><strong>Location:</strong> ${event.event_location}</p>
                <p><strong>Description:</strong> ${event.event_description}</p>
                <button onclick="deleteEvent(${event.id})">Delete Event</button>
                <hr>
            `;
            eventList.appendChild(eventElement);
        });
    })
    .catch(error => console.error('Error loading admin events:', error));
}

function deleteEvent(eventId) {
    const token = localStorage.getItem("token");

    if (confirm('Are you sure you want to delete this event?')) {
        fetch(`http://localhost:3000/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadAdminEvents();
        })
        .catch(error => console.error('Error deleting event:', error));
    }
}

// =========================
// Admin View Members List (members.html)
// =========================
document.addEventListener("DOMContentLoaded", function() {
    const membersList = document.getElementById("members-list");
    if (membersList) {
        const token = localStorage.getItem("token");

        fetch('http://localhost:3000/members', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        })
        .then(response => response.json())
        .then(data => {
            data.forEach(member => {
                const memberElement = document.createElement("div");
                memberElement.style.marginBottom = "20px";
                memberElement.innerHTML = `
                    <h3>${member.name}</h3>
                    <p><strong>Email:</strong> ${member.email}</p>
                    <p><strong>Reason for Joining:</strong> ${member.message}</p>
                    <button onclick="deleteMember(${member.id})">Delete Member</button>
                    <hr>
                `;
                membersList.appendChild(memberElement);
            });
        })
        .catch(error => console.error('Error fetching members:', error));
    }
});

function deleteMember(memberId) {
    const token = localStorage.getItem("token");

    if (confirm('Are you sure you want to delete this member?')) {
        fetch(`http://localhost:3000/members/${memberId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            window.location.reload();
        })
        .catch(error => console.error('Error deleting member:', error));
    }
}
