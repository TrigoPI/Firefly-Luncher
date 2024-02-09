<script lang="ts">
    import SocketIO from "$lib/confs/socket";
    import { onMount } from "svelte";

    export let enable: boolean;
    export let progress: number = 0;
    
    let size: number = 0;

    const onStep = async (current: number, total: number): Promise<void> => {
        size = Math.floor((total / 1000000) * 10) / 10;
        progress = Math.floor((current / 1000000) * 10) / 10;
    }

    onMount(() => SocketIO.OnStep(async (current: number, total: number) => await onStep(current, total)));
</script>

<div class="download-bar overflow-hidden {enable? "download-bar-enable" : "download-bar-disable"} bg-neutral-950">
    <div style="width: {(progress / size) * 100}%;" class="h-full bg-green-700" />
    <h1 class="absolute top-1/2 left-1/2 text-xl -translate-x-1/2 -translate-y-1/2 text-white">{ progress } / { size }Mb</h1>
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