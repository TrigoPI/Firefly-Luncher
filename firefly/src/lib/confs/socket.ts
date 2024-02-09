import { io, type Socket } from "socket.io-client";

export default class SocketIO {
    private static socket: Socket;
    private static disconnectCb: () => Promise<void>;
    private static connectCb: () => Promise<void>;
    private static onStep: (current: number, total: number) => Promise<void>;

    public static async Connect(url: string): Promise<void> {
        this.socket = io(url, { withCredentials: true });

        return new Promise<void>((resolve, reject) => {
            this.socket.on('connect', () => {
                this.connectCb();
                resolve();
            });

            this.socket.on('connect_error', (err: Error) => {
                reject(err);
            });

            this.socket.on('disconnect', () => {
                this.socket.close();
                this.disconnectCb();
            });

            this.socket.on('step', (data: any) => {
                this.onStep(data.current, data.size);
            });
        });
    }

    public static OnStep(cb: (current: number, total: number) => Promise<void>): void {
        this.onStep = cb;
    }

    public static OnDisconnect(cb: () => Promise<void>): void {
        this.disconnectCb = cb;
    }

    public static OnConnect(cb: () => Promise<void>): void {
        this.connectCb = cb;
    }

    public static Disconnect(): void {
        this.socket.disconnect();
    }
}