import { io, type Socket } from "socket.io-client";

export default class SocketIO {
    private static socket: Socket;
    private static disconnectCb: () => Promise<void>;
    private static connectErrorCb: (e: Error) => Promise<void>;
    private static onStep: (display: string, advancement: number, totalStep: number, step: number) => Promise<void>;
    private static onBackendError: (err: string) => Promise<void>;
    private static onStart: () => Promise<void>;

    public static async Connect(url: string): Promise<void> {
        this.socket = io(url);

        return new Promise<void>((resolve, reject) => {
            this.socket.on('connect', () => {
                resolve();
            });

            this.socket.on('connect_error', (err: Error) => {
                this.connectErrorCb(err);
            });

            this.socket.on('disconnect', () => {
                this.socket.close();
                this.disconnectCb();
            });

            this.socket.on('step', (data: any) => {
                this.onStep(data.display, data.advancement, data.total_step, data.step);
            });

            this.socket.on('backend-error', (data: any) => {
                this.onBackendError(data);
            });

            this.socket.on('start', () => {
                this.onStart();
            });
        });
    }

    public static OnBackendError(cb: (err: string) => Promise<void>): void {
        this.onBackendError = cb;
    }

    public static OnStep(cb: (display: string, advancement: number, totalStep: number, step: number) => Promise<void>): void {
        this.onStep = cb;
    }

    public static OnConnectError(cb: (e: Error) => Promise<void>): void {
        this.connectErrorCb = cb;
    }

    public static OnDisconnect(cb: () => Promise<void>): void {
        this.disconnectCb = cb;
    }

    public static OnStart(cb: () => Promise<void>): void {
        this.onStart = cb;
    } 

    public static Disconnect(): void {
        this.socket.disconnect();
    }
}