import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, InputGroup, Badge } from 'react-bootstrap';
import { MessageSquare, Send, X, User, MessageCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import api from '../api';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001');

interface ChatWidgetProps {
  roomId: string;
  recipientName: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ roomId, recipientName }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!roomId) return;
      try {
        const res = await api.get(`/messages/${roomId}`);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };

    fetchMessages();

    if (roomId) {
      socket.emit('join_room', roomId);
    }

    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
      if (!isOpen) setHasNewMessage(true);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [roomId, isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const messageData = {
      roomId,
      senderId: user?._id,
      senderName: user?.name,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    socket.emit('send_message', messageData);
    setMessages((prev) => [...prev, messageData]);
    setMessage('');
  };

  if (!isOpen) {
    return (
      <div 
        className="position-fixed bottom-0 end-0 m-4 shadow-lg rounded-circle bg-primary p-3 cursor-pointer animate-fade-in"
        style={{ zIndex: 1050, cursor: 'pointer' }}
        onClick={() => { setIsOpen(true); setHasNewMessage(false); }}
      >
        <MessageCircle size={32} className="text-white" />
        {hasNewMessage && (
          <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle border border-light p-2">
            <span className="visually-hidden">new messages</span>
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card 
      className="position-fixed bottom-0 end-0 m-4 shadow-lg glass-card border-0 animate-fade-in"
      style={{ zIndex: 1050, width: '350px', height: '450px' }}
    >
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center py-3 rounded-top-4">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-white p-1 rounded-circle shadow-sm">
            <User size={16} className="text-primary" />
          </div>
          <div>
            <div className="fw-bold small">{recipientName}</div>
            <div className="small opacity-75" style={{ fontSize: '0.65rem' }}>Secure Direct Message</div>
          </div>
        </div>
        <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
      </Card.Header>
      
      <Card.Body className="overflow-auto d-flex flex-column gap-2 p-3">
        {messages.length === 0 && (
          <div className="text-center my-auto opacity-25">
            <MessageSquare size={48} className="mx-auto mb-2" />
            <p className="small">No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`d-flex flex-column ${msg.senderId === user?._id ? 'align-items-end' : 'align-items-start'}`}
          >
            <div 
              className={`p-2 rounded-4 px-3 shadow-sm ${msg.senderId === user?._id ? 'bg-primary text-white' : 'bg-light'}`}
              style={{ maxWidth: '85%', fontSize: '0.9rem' }}
            >
              {msg.message}
            </div>
            <div className="small text-muted mt-1" style={{ fontSize: '0.65rem' }}>{msg.time}</div>
          </div>
        ))}
        <div ref={scrollRef} />
      </Card.Body>

      <Card.Footer className="bg-transparent border-0 p-3">
        <Form onSubmit={handleSendMessage}>
          <InputGroup className="bg-light rounded-pill p-1 shadow-sm border">
            <Form.Control 
              placeholder="Type a message..."
              className="bg-transparent border-0 shadow-none px-3 py-2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button variant="primary" type="submit" className="rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
              <Send size={18} />
            </Button>
          </InputGroup>
        </Form>
      </Card.Footer>
    </Card>
  );
};

export default ChatWidget;
