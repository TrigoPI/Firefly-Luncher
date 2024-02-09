<script lang="ts">
    import "../app.css";

    import { onMount } from "svelte";
    
    import { Firebase } from "$lib/confs/firebase";
    import SocketIO from "$lib/confs/socket";
    
    import Navbar from "../components/navbar.svelte";
    import Loading from "./loading.svelte";

    let logged: boolean = false;

    onMount(async () => {
        SocketIO.OnDisconnect(async () => {
            console.log("Lost connection");
            logged = false;
            
            try {
                await SocketIO.Connect("ws://localhost:3000");
                console.log("connection success");
                logged = true;
            } catch {
                console.log("connection ws failed");
            }
        });

        SocketIO.OnConnect(async () => {
            logged = true;
        });

        try {
            await Firebase.Initizalize();
            await SocketIO.Connect("ws://localhost:3000");
        } catch (e: any) {
            console.log("connection ws failed");
        }
    });
</script>

{#if logged}
    <Navbar />
    <slot />
{:else}
    <Loading />
{/if}