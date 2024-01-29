package com.chat.app.Config.Annotation;

import java.util.List;

import org.springframework.messaging.handler.invocation.HandlerMethodArgumentResolver;
import org.springframework.messaging.handler.invocation.HandlerMethodReturnValueHandler;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

import ch.qos.logback.classic.pattern.MessageConverter;

public interface WebSocketMessageBrokerConfigurer {
	
	default void registerstompEndpoints(StompEndpointRegistry registry) {
		
	}
	
	default void configureWebSocketTransport(WebSocketTransportRegistration registry) {
		
	}
	
	default void configureClientInboundChannel(ChannelRegistration registration) {
		
	}
	
    default void configureClientOutboundChannel(ChannelRegistration registration) {
		
	}
    
    default void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
    	
    }
    
    default void addReturnValueHandlers(List<HandlerMethodReturnValueHandler> returnValueHandler) {
    	
    }
    
    default boolean configurerMessageConverters(List<MessageConverter> messageConverters) {
		return false;
   
    }
    
    default void configureMessageBroker(MessageBrokerRegistry registry) {
    	
    }

}
