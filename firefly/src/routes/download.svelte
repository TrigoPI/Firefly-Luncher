<script lang="ts">
    import RestClient from "@lib/rest-client/RestClient";
    import SocketIO from "@lib/utils/socket";
    import { Tauri } from "@lib/utils/tauri";
    import { onMount } from "svelte";

    export let enable: boolean;
    export let onFinish: () => void;

    let progress: number = 0;
    let message: string = "loading"

    const onStep = async (display: string, advancement: number, totalStep: number, step: number): Promise<void> => {
        const size = 100 / totalStep;
        message = display;
        progress = size * (step + advancement);
    }

    SocketIO.OnStart(async () => {
        onFinish();
        setTimeout(async () => {
            Tauri.WriteLog("log.txt", "Lunching game --> Closing app");
            await Tauri.CloseApp();
        }, 2000);
    });
    
    onMount(() => SocketIO.OnStep(async (display: string, advancement: number, totalStep: number, step: number) => await onStep(display, advancement, totalStep, step)));
</script>

<div class="download-bar overflow-hidden {enable? "download-bar-enable" : "download-bar-disable"} bg-neutral-950">
    <div style="width: {progress}%;" class="h-full bg-green-700" />
    <h1 class="absolute top-1/2 left-1/2 text-xl -translate-x-1/2 -translate-y-1/2 text-white">{ message }</h1>
</div>

<style>
    .download-bar {
        position: absolute;
        bottom: 0;
        width: 100%;
        z-index: 999;
        transition-duration: 500ms;
    }

    .download-bar-disable {
        height: 0;
    }

    .download-bar-enable {
        height: 2.5rem;
    }
</style>