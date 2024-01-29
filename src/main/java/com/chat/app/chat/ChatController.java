package com.chat.app.chat;

import java.time.LocalDateTime;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import com.chat.app.chat.entites.ChatMessage;

@Controller
public class ChatController {

	@MessageMapping("chat.sendMessage")
	@SendTo("/topic/public")
	public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
		chatMessage.setTyping(false);
		chatMessage.setTimestamp(LocalDateTime.now());
		return chatMessage;
	}

	@MessageMapping("/chat.typing")
	@SendTo("/topic/public")
	public ChatMessage typingIndicator(@Payload ChatMessage chatMessage) {
		return chatMessage;
	}

	@MessageMapping("chat.addUser")
	@SendTo("/topic/public")
	public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
		headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
		chatMessage.setTimestamp(LocalDateTime.now());
		return chatMessage;
	}

	@MessageMapping("/chat.removeUser")
	@SendTo("/topic/public")
	public ChatMessage removeUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
		String username = (String) headerAccessor.getSessionAttributes().get("username");
		if (username != null) {
			ChatMessage leaveMessage = new ChatMessage();
			leaveMessage.setType(MessageType.LEAVE);
			leaveMessage.setSender(username);
			headerAccessor.getSessionAttributes().remove("username");
			return leaveMessage;
		}
		return null;
	}

}
