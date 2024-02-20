<script lang="ts">
    import { stateStore, type AppState } from "@lib/stores/state-store";
    import RestClient from "@lib/rest-client/RestClient";
    import Download from "./download.svelte";

    let isMouseEnter: boolean = false;
    let state: AppState = "idle";

    const onMouseHover = (hover: boolean) => {
        if (state != "idle") return;
        isMouseEnter = hover;
    }

    const onPlay = async (): Promise<void> => {
        if (state != "idle") return;
        stateStore.set("download");
        await RestClient.Post("http://localhost:3000/play");
    }

    stateStore.subscribe((value: AppState) => state = value);
</script>

<div class="background {isMouseEnter? "mouse-enter" : ""}"></div>
<div class="w-full h-full relative overflow-hidden">
    <div class="py-8 flex flex-col justify-center items-center relative bg-opacity-90 bg-neutral-950">
        <h1 class="tracking-in-expand title text-white flex">FIREFLY</h1>
        <button 
            class="scale-in-center flex play py-10 px-24 text-8xl rounded-md duration-100 absolute top-full -translate-y-1/2  bg-green-700 {state != "idle"? "cursor-default" : "hover:scale-110"}"
            on:mouseenter={ () => onMouseHover(true)  }
            on:mouseleave={ () => onMouseHover(false) }
            on:mousedown={ onPlay }
        >
            {#if state == "idle" }
                PLAY
            {/if}
            {#if state == "download"}
                INSTALLATION...
            {/if}
            {#if state == "lunching"}
                LANCEMENT...
            {/if}
        </button>
    </div>

    <Download 
        enable={ state == "download" } 
        onFinish={ () => stateStore.set("lunching") }
    />
</div>

<style>
    .background {
        width: 100vw;
        height: 100vh;
        position: absolute;
        background: url(https://wallpapers-clan.com/wp-content/uploads/2023/11/cool-minecraft-pixel-desktop-wallpaper-preview.jpg);
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        transition-duration: 600ms;
    }

    .mouse-enter {
        scale: 1.1;
    }

    .title {
        font-size: 15rem;
        font-weight: 500;
    }

    .play {
        font-family: 'Pixelify Sans', sans-serif;
        font-weight: 700;
    }
</style>