import React, { useState, useRef, useEffect, FormEvent } from 'react';

interface Message {
    id: number;
    author: string;
    content: string;
}

interface ChatProps {
    username: string;
    messages: Message[];
    onSend: (content: string) => void;
}

const Chat: React.FC<ChatProps> = ({ username, messages, onSend }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSend(input.trim());
            setInput('');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1rem',
                    background: '#f5f5f5',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                }}
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            marginBottom: '0.5rem',
                            textAlign: msg.author === username ? 'right' : 'left',
                        }}
                    >
                        <span
                            style={{
                                fontWeight: msg.author === username ? 'bold' : 'normal',
                                color: msg.author === username ? '#1976d2' : '#333',
                            }}
                        >
                            {msg.author}
                        </span>
                        : {msg.content}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type your message..."
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '4px 0 0 4px',
                        border: '1px solid #ccc',
                        outline: 'none',
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0 4px 4px 0',
                        border: 'none',
                        background: '#1976d2',
                        color: '#fff',
                        cursor: 'pointer',
                    }}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat;