<script lang="ts">
    import { popupMessage } from "@lib/stores/popup-store";
    
    let message: string[] = [];

    popupMessage.subscribe((value: string[]) =>{
        if (value.length == 0) return;
        message = [...message, ...value];
        popupMessage.set([]);
    });
</script>

{#if message.length != 0}
    <div class="z-50 absolute w-screen h-screen flex items-center justify-center top-0 left-0 bg-opacity-50 text-white bg-neutral-950">
        <div class="msg-container p-6 rounded-md shadow-md bg-neutral-700">
            {#each message[message.length - 1].split("\r\n") as msg}
                <p class="text-lg">{ msg }</p>
            {/each}
            <div class="flex justify-end">
                <button 
                    class="mt-6 rounded-sm text-2xl font-semibold py-4 px-12 duration-100 hover:scale-105 bg-green-700"
                    on:click={ () => message = message.filter(value => value != message[message.length - 1]) }
                >
                    OK
                </button>
            </div>
        </div>
    </div>
{/if}

<style> 
    .msg-container {
        max-width: 50%;
    }
</style>