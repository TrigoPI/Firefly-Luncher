<script lang="ts">
    import "../app.css";
    import { Firebase } from "$lib/confs/firebase";
    import Navbar from "../components/navbar.svelte";
    import { onMount } from "svelte";

    let logged: boolean = false;

    onMount(async () => {
        try {
            await Firebase.Initizalize();
            logged = true;
        } catch (e: any) {
            console.log(e);
        }
    });
</script>

{#if logged}
    <Navbar />
    <slot />
{/if}