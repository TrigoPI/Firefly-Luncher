<script lang="ts">
    import RestClient from "@lib/rest-client/RestClient";
    import Fa from "svelte-fa";

    import { type Mod } from "shared/types/minecraft";

    import url from "@conf/url.json";
    import { faEye, faEyeSlash, faTrash } from "@fortawesome/free-solid-svg-icons";
    import { popupMessage } from "@lib/stores/popup-store";

    export let mod: Mod;
    export let onModDeleted: (mod: Mod) => void;

    const handleModDisabled = async (): Promise<void> => {
        const [_, err] = await RestClient.Post(`${url.api}/mod/${!mod.enable? "enable" : "disable"}/${mod.side}/${mod.name}`); 
        
        if (err) {
            popupMessage.update((value: string[]) => [ `Une erreur est survenue : \r\n${err}`, ...value]);
            return;
        }
        
        mod.enable = !mod.enable;
    }

    const handleModRemoved = async (): Promise<void> => {
        const [_, err] = await RestClient.Post(`${url.api}/mod/delete/${mod.side}/${mod.name}`);

        if (err) {
            popupMessage.update((value: string[]) => [ `Une erreur est survenue : \r\n${err}`, ...value]);
            return;
        }

        onModDeleted(mod);
    }
</script>

<li class="flex justify-between py-8 px-12 gap-20 text-xl rounded-md bg-neutral-800">
    <div class="flex items-center gap-2">
        {#if mod.enable}
            <div class="w-3 h-3 rounded-full bg-green-700"></div>
            <span class="min-w-12 max-w-12">Actif</span>
        {:else}
            <div class="w-3 h-3 rounded-full bg-orange-700"></div>
            <span class="min-w-12 max-w-12">Inactif</span>
        {/if}
    </div>
    <div class="w-60">
        <span class="font-bold break-words">{ mod.name }</span>
    </div>
    <div class="flex items-center gap-2">
        <button class="max-w-8 min-w-8 opacity-20 duration-150 hover:opacity-100 hover:text-orange-400 hover:scale-110" on:click={ handleModDisabled }>
            {#if mod.enable}
                <Fa icon={ faEye } />
            {:else}
                <Fa icon={ faEyeSlash } />
            {/if}
        </button>
        <button class="max-w-8 opacity-20 duration-150 hover:opacity-100 hover:text-red-700 hover:scale-110" on:click={ handleModRemoved }>
            <Fa icon={ faTrash } />
        </button>
    </div>
</li>