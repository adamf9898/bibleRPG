/**
 * network.ts
 * Handles network communication for the BibleRPG game client.
 */

export type NetworkMessage = {
    type: string;
    payload?: any;
};

export class GameNetwork {
    private socket: WebSocket | null = null;
    private url: string;
    private messageHandlers: Array<(msg: NetworkMessage) => void> = [];

    constructor(serverUrl: string) {
        this.url = serverUrl;
    }

    connect(): void {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log('Connected to game server:', this.url);
        };

        this.socket.onmessage = (event: MessageEvent) => {
            try {
                const msg: NetworkMessage = JSON.parse(event.data);
                this.messageHandlers.forEach(handler => handler(msg));
            } catch (e) {
                console.error('Failed to parse network message:', e);
            }
        };

        this.socket.onclose = () => {
            console.log('Disconnected from game server');
        };

        this.socket.onerror = (event: Event) => {
            console.error('WebSocket error:', event);
        };
    }

    send(message: NetworkMessage): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.warn('Cannot send message, socket not open');
        }
    }

    onMessage(handler: (msg: NetworkMessage) => void): void {
        this.messageHandlers.push(handler);
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}