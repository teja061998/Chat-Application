'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var isTyping = false;
var typingTimer;
var stompClient = null;
var username = null;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    username = document.querySelector('#name').value.trim();
    if (username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');
        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}

function onConnected() {
    stompClient.subscribe('/topic/public', onMessageReceived);
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({ sender: username, type: 'JOIN' })
    );
    connectingElement.classList.add('hidden');
    connectingElement.classList.add('hidden');
    document.getElementById('leaveButton').classList.remove('hidden');
}

function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
    document.getElementById('leaveButton').classList.add('hidden');
}

function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    if (message.type === 'TYPING') {
        document.querySelectorAll('.typing-message').forEach(function (element) {
            element.remove();
        });
        var typingElement = document.createElement('li');
        typingElement.classList.add('typing-message');
        typingElement.textContent = message.sender + ' is typing...';
        messageArea.appendChild(typingElement);
    } else {
        document.querySelectorAll('.typing-message').forEach(function (element) {
            element.remove();
        });
        var messageElement = document.createElement('li');
        if (message.type === 'JOIN' || message.type === 'LEAVE') {
            messageElement.classList.add('event-message');
            message.content = message.content || message.sender + ' ' + message.type.toLowerCase() + 'ed!';
        } else {
            messageElement.classList.add('chat-message');
            var isOwnMessage = message.sender === username;
            if (isOwnMessage) {
                messageElement.classList.add('own-message');
            } else {
                messageElement.classList.add('other-message');
                if (message.type === 'NOTIFICATION') {
                    displayNotification(message);
                    return;
                }
            }
            var timestampElement = document.createElement('span');
            timestampElement.classList.add('timestamp');
            var timestampText = document.createTextNode(formatTimestamp(message.timestamp));
            timestampElement.appendChild(timestampText);
            messageElement.appendChild(timestampElement);
            var avatarElement = document.createElement('i');
            var avatarText = document.createTextNode(message.sender[0]);
            avatarElement.appendChild(avatarText);
            avatarElement.style['background-color'] = getAvatarColor(message.sender);
            messageElement.appendChild(avatarElement);
            var usernameElement = document.createElement('span');
            var usernameText = document.createTextNode(message.sender);
            usernameElement.appendChild(usernameText);
            messageElement.appendChild(usernameElement);
        }
        var textElement = document.createElement('p');
        var messageText = document.createTextNode(message.content);
        textElement.appendChild(messageText);
        messageElement.appendChild(textElement);
        messageArea.appendChild(messageElement);
        messageArea.scrollTop = messageArea.scrollHeight;
    }
}

function displayNotification(notification) {
    var notificationElement = document.createElement('div');
    notificationElement.classList.add('notification');
    notificationElement.innerHTML = `<strong>${notification.sender}</strong>: ${notification.content}`;
    document.getElementById('notificationArea').appendChild(notificationElement);
    document.getElementById('notificationArea').classList.add('show');
    setTimeout(() => {
        document.getElementById('notificationArea').classList.remove('show');
    }, 5000);
}

function formatTimestamp(timestamp) {
    var options = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return new Date(timestamp).toLocaleTimeString(undefined, options);
}

function leaveChat() {
    if (stompClient) {
        var leaveMessage = {
            sender: username,
            type: 'LEAVE'
        };
        stompClient.send("/app/chat.removeUser", {}, JSON.stringify({ sender: username, type: 'LEAVE' }));
        stompClient.disconnect();
    }
    usernamePage.classList.remove('hidden');
    chatPage.classList.add('hidden');
}

function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

function sendTypingIndicator() {
    if (!isTyping) {
        isTyping = true;
        stompClient.send("/app/chat.typing", {}, JSON.stringify({
            sender: username,
            type: 'TYPING',
            content: '',  // Ensure content is present
            typing: true
        }));
    }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        isTyping = false;
        stompClient.send("/app/chat.typing", {}, JSON.stringify({
            sender: username,
            type: 'TYPING',
            content: '',  // Ensure content is present
            typing: false
        }));
    }, 1000); // Adjust the timeout duration as needed
}

function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT',
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}

messageInput.addEventListener('input', sendTypingIndicator);
usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', sendMessage, true)
