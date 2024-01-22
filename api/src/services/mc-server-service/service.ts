import serviceConf from "../../../conf/service.conf.json";
import mcServerConf from "../../../conf/mcserver.conf.json";
import firebaseConf from "../../../conf/firebase.conf.json";

import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, User, getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth"
import { DatabaseReference, ref, Database, getDatabase, set } from "firebase/database";

import { ServerState } from "shared/types/minecraft";
import { Get, Post, Response, Route, Service, ServiceClass, WebString } from "dolphin";

import { SERVER_STATE } from "../../minecraft/mc-server/ServerState";
import McServer from "../../minecraft/mc-server/McServer";
import { EventClass } from "../../minecraft/lib/event/Event";
import EventDispatcher from "../../minecraft/lib/event/EventDispatcher";
import { McConsoleEvent, McServerStateChangedEvent } from "../../minecraft/core/Event";

@Service("mc-server-service", "/mc-server", serviceConf.mc_server.ip, serviceConf.mc_server.port)
export default class McServerService extends ServiceClass {
    private mcServer: McServer;
    private serverStateRef: DatabaseReference;
    private serverLogRef: DatabaseReference;
    private cmdId: number;

    public override async OnStart(): Promise<void> {
        this.cmdId = 0;
        this.mcServer = new McServer(mcServerConf.path, mcServerConf.name, mcServerConf.version);
        this.mcServer.SetCustomStartCommand(mcServerConf.cmd);
        this.mcServer.AddEventListener(e => this.OnMcServerEvent(e));

        await this.AuthToFirebase();
    }

    private ServerStateToString(state: SERVER_STATE): ServerState {
        switch (state) {
            case SERVER_STATE.STOPPED: return 'stopped';
            case SERVER_STATE.LOADING: return 'loading';
            case SERVER_STATE.RUNNING: return 'running';
        }
    }

    private async AuthToFirebase(): Promise<void> {
        const app: FirebaseApp = initializeApp(firebaseConf);
        const auth: Auth = getAuth();
        const database: Database = getDatabase();

        try {
            await signInAnonymously(auth);
            onAuthStateChanged(auth, async (user: User) => {
                if (!user) return;

                const serverName: string = this.mcServer.GetName();
                const state: ServerState = 'stopped';
                
                this.serverStateRef = ref(database, `server-state/${serverName}`);
                this.serverLogRef = ref(database, `server-log`);

                await set(this.serverStateRef, { state });
                await set(this.serverLogRef, {});
            });
        } catch (e: any) {
            console.log(e);
        }
    } 

    private OnMcServerEvent(e: EventClass): void {
        const dispatcher: EventDispatcher = new EventDispatcher(e);
        dispatcher.Dispatch(McServerStateChangedEvent, e => this.OnMcServerStateChanged(e));
        dispatcher.Dispatch(McConsoleEvent, e => this.OnMcConsoleOut(e));
    }

    private OnMcServerStateChanged(e: McServerStateChangedEvent): void {
        const state: ServerState = this.ServerStateToString(e.state);
        set(this.serverStateRef, { state });
    }

    private OnMcConsoleOut(e: McConsoleEvent): void {
        const database: Database = getDatabase();
        const cmdReference: DatabaseReference = ref(database, `server-log/${this.cmdId}`);
        this.cmdId++;
        set(cmdReference, e.data);
    }

    @Get
    @Route("/properties")
    public async OnGetProperties(): Promise<Response> {
        return Response.Json(this.mcServer.GetServerProperties());
    }

    @Get
    @Route("/buffer")
    public async OnGetBuffer(): Promise<Response> {
        return Response.Json(this.mcServer.GetBuffer());
    }

    @Post
    @Route("/command")
    public async OnServerCommand(
        @WebString("cmd") cmd: string
    ): Promise<Response> {
        try {
            this.mcServer.Write(cmd);
            return Response.Ok();
        } catch (e: any) {
            return Response.Unauthorized();
        }
    }

    @Post
    @Route("/start")
    public async OnServerStart(): Promise<Response> {
        this.cmdId = 0;
        await set(this.serverLogRef, {});

        try {
            this.mcServer.Start();
            return Response.Ok();
        } catch (e: any) {
            return Response.Unauthorized();            
        }
    }

    @Post
    @Route("/stop")
    public async OnServerStop(): Promise<Response> {
        try {
            this.mcServer.Stop();
            return Response.Ok();
        } catch (e: any) {
            return Response.Unauthorized();            
        }
    }
}