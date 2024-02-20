<script lang="ts">
    import "../app.css";
    import "iconify-icon"

    import { onMount } from "svelte";
    
    import { Firebase } from "@lib/utils/firebase";
    import url from "@conf/url.json";
    import SocketIO from "@lib/utils/socket";
    
    import Navbar from "../components/navbar.svelte";
    import Loading from "./loading.svelte";
    import { Tauri } from "@lib/utils/tauri";
    import OfflineBanner from "./offline-banner.svelte";
    import RestClient from "@lib/rest-client/RestClient";
    import Popup from "@components/popup.svelte";
    import { popupMessage } from "@lib/stores/popup-store";
    import { stateStore, type AppState } from "@lib/stores/state-store";

    let state: number = 0b0001;
    let appState: AppState = "idle";

    const pingInterval = (): void => {
        const id = setInterval(async (): Promise<void> => {
            const [_, err] = await RestClient.Get(`${url.api}/ping`);
            if (!err) {
                Tauri.WriteLog("log.txt", "API online");
                state = state | 0b0100;
                clearInterval(id);
            } 
        }, 5000);
    }

    const pingAPI = async (): Promise<void> => {
        const [_, err] = await RestClient.Get(`${url.api}/ping`);
        
        if (err) {
            Tauri.WriteLog("log.txt", "API offline");
            popupMessage.update((value: string[]) => ["Impossible de ping l'API : Luncher en mode offline", ...value]);
            
            state = state & 0b1011;
        } else {
            Tauri.WriteLog("log.txt", "API online");
            state = state | 0b0100;
        }

        pingInterval();
    }

    const onSocketDisconnect = async (): Promise<void> => {
        if (appState == "download") stateStore.set("idle");

        state = state | 0b0001;
        state = state & 0b1101;

        Tauri.WriteLog("log.txt", `Connection lost with ${url.backend}`);  
        await SocketIO.Connect(url.backend);
        Tauri.WriteLog("log.txt", `Connection success with ${url.backend}`);
    
        state = state & 0b1110;
        state = state | 0b0010;
    }

    const onSocketConnectError = async (e: Error): Promise<void> => {
        Tauri.WriteLog("log.txt", `Connection to ${url.backend} failed`);
        Tauri.WriteLog("log.txt", e.toString());

        state = state | 0b0001;
        state = state & 0b1101;
    }

    const onSocketBackendError = async (msg: string) => {
        popupMessage.update((value: string[]) => [msg, ...value]);
        stateStore.set("idle");
    }

    const onFirebaseDisconnect = (): void => {
        Tauri.WriteLog("log.txt", `Connection to Firebase failed`);
        popupMessage.update((value: string[]) => ["Echec de connection à Firebase : Luncher en mode offline", ...value]);        
        state = state & 0b0110;
    }
    
    const onFirebaseConnect = async (): Promise<void> => {
        Tauri.WriteLog("log.txt", `Connection to Firebase success`);
        state = state | 0b1000;
        state = state & 0b1110;
    }

    const runBackend = async (): Promise<void> => {
        await Tauri.LunchBackend();
    }

    const initSocket = (): void => {
        SocketIO.OnConnectError(async (e: Error) => await onSocketConnectError(e));
        SocketIO.OnBackendError(async (msg: string) => await onSocketBackendError(msg));
        SocketIO.OnDisconnect(async () => await onSocketDisconnect());
    }

    const initFirebase = (): void => {
        Firebase.OnConnect(() => onFirebaseConnect());
        Firebase.OnDisonnect(() => onFirebaseDisconnect());
    }

    const connectToSocket = async (): Promise<void> => {
        await SocketIO.Connect(url.backend);
        Tauri.WriteLog("log.txt", `Connection to ${url.backend} success`);
        state = state | 0b0010;
    }

    const connectToFirebase = async (): Promise<void> => {
        await Firebase.Initizalize();
    }

    onMount(async () => {
        initSocket();
        initFirebase();

        await runBackend();
        await connectToSocket();
        await pingAPI();
        await connectToFirebase();

    });

    stateStore.subscribe((value: AppState) => appState = value);
</script>


{#if (state & 0b0001) != 1}
    {#if (state >> 1) != 7}
        <OfflineBanner />
    {/if}

    <Popup />
    <Navbar online={ (state >> 1) == 7 } />
    <slot />
{/if}

{#if (state & 0b0001) == 1}
    <Loading />
{/if}