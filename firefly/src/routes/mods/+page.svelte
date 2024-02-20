<script lang="ts">
    import { faDesktop, faGlobe, faPlus } from "@fortawesome/free-solid-svg-icons";
    import { onMount } from "svelte";
    import Fa from "svelte-fa";
    
    import { type Mod, type ModList } from "shared/types/minecraft";

    import RestClient from "@lib/rest-client/RestClient";
    import url from "@conf/url.json";

    import ListItem from "./list-item.svelte";
    import ModMenu from "./mod-menu.svelte";
    import { popupMessage } from "@lib/stores/popup-store";

    let isMenuOpen: boolean = false;
    let side: "client" | "server" = "client";
    let clientMods: Mod[] = [];
    let serverMods: Mod[] = [];

    const handleModAdded = (mods: ModList): void => {
        clientMods = [ ...clientMods, ...mods.client ];
        serverMods = [ ...serverMods, ...mods.server ];
    }

    const handleModDeleted = (mod: Mod): void => {
        if (mod.side == "client") clientMods = clientMods.filter((value: Mod) => value.name != mod.name);
        if (mod.side == "server") serverMods = serverMods.filter((value: Mod) => value.name != mod.name);
    }

    onMount(async () => {
        const [response, error] = await RestClient.Get(`${url.api}/mods/list`);
        
        if (error) {
            popupMessage.update((value: string[]) => [ `Une erreur est survenue : \r\n${error}`, ...value]);
            return;
        }

        const mods: ModList = response.Json<ModList>();
        clientMods = mods.client;
        serverMods = mods.server;
    });
</script>

<div class="w-full max-h-screen overflow-hidden overflow-y-scroll flex text-white">
    <div class="flex-1 flex py-4">
        <div class="flex-1">
            <div class="py-8 flex justify-center gap-8 text-xl">
                <button 
                    class="flex gap-2 items-center px-8 py-4 rounded-md duration-150 {(side == "client")? "selected" : "not-selected"}"
                    on:click={ () => side = "client" }
                >
                    <Fa icon={ faDesktop } />
                    <span>Client</span>
                </button>
                <button 
                    class="flex gap-2 items-center px-8 py-4 rounded-md duration-150 {(side == "server")? "selected" : "not-selected"}"
                    on:click={ () => side = "server" }
                >
                    <Fa icon={ faGlobe } />
                    <span>Serveur</span>
                </button>
            </div>
            {#if side == 'client'}
                {#if clientMods.length == 0}
                    <div class="flex items-center flex-col">
                        <h1 class="text-5xl py-12">Aucun mod installé</h1>
                        <button class="text-3xl border-4 border-dashed rounded-md py-4 px-16 duration-150 hover:scale-110" on:click={ () => isMenuOpen = true }>
                            <Fa icon={ faPlus } />
                        </button>
                    </div>
                {:else}
                    <ul class="flex flex-col items-center gap-4">
                        {#each clientMods as mod}
                            <ListItem 
                                mod={ mod } 
                                onModDeleted={ mod => handleModDeleted(mod) }    
                            />
                        {/each}
                    </ul>
                {/if}
            {:else}
                {#if serverMods.length == 0}
                    <div class="flex items-center flex-col">
                        <h1 class="text-5xl py-12">Aucun mod installé</h1>
                        <button class="text-3xl border-4 border-dashed rounded-md py-4 px-16 duration-150 hover:scale-110" on:click={ () => isMenuOpen = true }>
                            <Fa icon={ faPlus } />
                        </button>
                    </div>
                {:else}
                    <ul class="flex flex-col items-center gap-4">
                        {#each serverMods as mod}
                            <ListItem 
                                mod={ mod } 
                                onModDeleted={ mod => handleModDeleted(mod) }
                            />
                        {/each}
                    </ul>
                {/if}
            {/if}
        </div>
        <ModMenu 
            isOpen={ isMenuOpen }
            onModsAdded={ handleModAdded }
        />
    </div>
</div>

<style>
    .selected {
        background-color: rgb(21 128 61);
        border: 1px solid transparent;
        scale: 1.2;
    }

    .not-selected {
        border: 1px solid;
        scale: 0.9;
    }

    .not-selected:hover {
        border: 1px solid transparent;
        background-color: rgb(22, 163, 74);
        scale: 1;
    }
</style>