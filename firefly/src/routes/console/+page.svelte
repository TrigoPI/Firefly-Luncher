<script lang="ts">
    import Fa from "svelte-fa";
    import RestClient from "@lib/rest-client/RestClient";

    import url from "@conf/url.json";
    import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
    import { DataSnapshot, onChildAdded, onValue } from "firebase/database";
    import { Firebase } from "@lib/utils/firebase";
    import { tick } from "svelte";
    import { popupMessage } from "@lib/stores/popup-store";

    let buffer: string[] = [];
    let input: HTMLInputElement;
    let consoleElement: HTMLElement;

    const scrollToBottom = async (node: HTMLElement) => {
        if (!node) return;
        node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
    }; 

    const handleKeyDown = async (e: KeyboardEvent) => {
        if (e.key != "Enter") return;
        
        const cmd: string = input.value;
        input.value = "";

        switch (cmd.replaceAll(" ", "").toLowerCase()) {
            case "clear":
                buffer = []
                break;

            default: 
                const [_, err] = await RestClient.Post(`${url.api}/server/command`, { cmd });
                
                if (err) {
                    if (err.code == 401) {
                        popupMessage.update((value: string[]) => [ `Le serveur n'est pas démarré`, ...value]);
                        break;
                    }
                    
                    popupMessage.update((value: string[]) => [ `Une erreur est survenue : \r\n${err}`, ...value]);
                    break;
                }
            
                buffer = [ ...buffer, cmd ];    
                
                await tick();
                scrollToBottom(consoleElement);

                break;
        }
    }

    onValue(Firebase.SERVER_LOG_REF, (snapshot: DataSnapshot) => {
        const val: any = snapshot.val();
        if (!val) buffer = [];
    });
    
    onChildAdded(Firebase.SERVER_LOG_REF, async (snapshot: DataSnapshot) => {
        buffer = [...buffer, snapshot.val()];
        await tick();
        scrollToBottom(consoleElement);
    });
</script>

<div class="w-full h-screen text-white">
    <div class="w-full h-full flex items-center justify-center py-16">
        <div class="overflow-hidden flex flex-col h-full w-3/4 rounded-md bg-neutral-800">
            <div class="bg-neutral-700">
                <h1 class="text-center text-2xl py-2">Console</h1>
            </div>
            <div class="flex flex-col flex-1 p-2 break-words overflow-y-scroll" bind:this={ consoleElement }>
                {#each buffer as text}
                    <div>
                        <p class="break-all font-thin">
                            <strong class="text-lg">mc@firely ></strong> 
                            { text }
                        </p>
                    </div>
                {/each}
            </div>
            <div class="bg-neutral-700 px-4 py-2">
                <div class="flex items-center gap-2">
                    <Fa icon={ faChevronRight } size="lg" />
                    <input 
                        class="bg-transparent p-2 w-full focus:outline-none"
                        bind:this={ input }
                        on:keydown={ e => handleKeyDown(e) }
                    />
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    ::-webkit-scrollbar-track    {
        background-color: rgb(38 38 38);
    }

    ::-webkit-scrollbar-thumb
{
	border-radius: 10px;
	background-color: rgb(64 64 64);
}
</style>