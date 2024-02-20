<script lang="ts">
    import { faXmark, faPlus, faCheck, faDesktop, faGlobe, faUpload } from "@fortawesome/free-solid-svg-icons"
    import Fa from "svelte-fa";
    import Dropzone from "svelte-file-dropzone";
    
    import type { ModList } from "shared/types/minecraft";
    
    import url from "@conf/url.json";
    import Checkbox from "@components/checkbox.svelte";
    import RestClient from "@lib/rest-client/RestClient";
    import { popupMessage } from "@lib/stores/popup-store";
    
    export let onModsAdded: (mods: ModList) => void;
    export let isOpen: boolean;

    let fileInput: HTMLInputElement;
    let fileState: "idle" | "hover" | "valid" | "invalid" = "idle";
    let files: File[] = [];

    const handleSubmit = async (e: SubmitEvent): Promise<void> => {
        e.preventDefault();
        e.stopPropagation();

        const formElement: HTMLFormElement = <HTMLFormElement>e.target;
        const form: FormData = new FormData(formElement);
        
        const clientCheck: FormDataEntryValue | null = form.get("client");
        const serverCheck: FormDataEntryValue | null = form.get("server");        
        if (!clientCheck && !serverCheck) return;
        
        const modSide: string[] = [];
        if (clientCheck) modSide.push("client");
        if (serverCheck) modSide.push("server");
        if (modSide.length == 0) return;

        const datas: FormData = new FormData();
        datas.append("side", modSide.join(";"));

        for (const file of files) datas.append("jar", file, file.name);

        const [res, err] = await RestClient.PostForm(`${url.api}/mods/add`, datas);  
          
        if (err) {
            popupMessage.update((value: string[]) => [ `Une erreur est survenue : \r\n${err}`, ...value]);
            return;
        }

        fileState = "idle";
        files = [];
        
        onModsAdded(res.Json<ModList>());
    }

    const handleCancel = (): void => {
        fileState = "idle";
        files = [];
    }

    const handleInputChange = (e: Event): void => {
        const target: HTMLInputElement = <HTMLInputElement>e.target;        
        if (!target.files) return;
        
        const validFiles: File[] = [];

        for (const file of target.files) {
            const nameSplit: string[] = file.name.split(".");
            const ext: string = nameSplit[nameSplit.length - 1];
            if (ext == "jar") validFiles.push(file); 
        }

        if (validFiles.length == 0) {
            fileState == "invalid";
            return;
        }

        fileState = "valid";
        files = [ ...validFiles, ...files ];
    }

    const handleDrop = (e: CustomEvent): void => {
        if (e.detail.acceptedFiles.length == 0) {
            fileState = "idle";
            return;
        }

        fileState = "valid";
        files = e.detail.acceptedFiles;
    }
</script>

{#if !isOpen}    
    <button 
        class="left-full -translate-x-full absolute p-4 z-50 text-2xl opacity-30 duration-150 hover:opacity-100 text-white"
        on:click={ () => isOpen = true }
    >
        <Fa icon={ faPlus } />
    </button>
{/if}

<div class="mod-menu flex flex-col overflow-x-hidden border-l {isOpen? "mod-menu-open border-neutral-800" : "mod-menu-close border-transparent"}">
    <div class="p-4 text-2xl">
        <button type="button" class="opacity-30 duration-150 hover:opacity-100" on:click={() => isOpen = false}>
            <Fa icon={ faXmark } />
        </button>
    </div>
    <form class="overflow-hidden flex-1 flex flex-col items-center px-4 text-nowrap" on:submit={ handleSubmit }>
        <h1 class="text-4xl pb-12 text-center">Ajouter des mods</h1> 
        <Dropzone 
            disableDefaultStyles={ true }
            accept=".jar"

            on:dragenter={ () => fileState = "hover"}
            on:dragleave={ () => fileState = "idle" }
            on:drop={ handleDrop}
        >
            <button
                type="button"
                class="py-24 px-20 border-4 border-dashed rounded-md text-3xl duration-150 hover:scale-105" 
            >
                {#if fileState == "idle"  || fileState == "invalid"}
                    <Fa icon={ faPlus } />
                {/if}

                {#if fileState == "valid"}
                    <Fa icon={ faCheck } />
                {/if}
                
                {#if fileState == "hover"}
                    <Fa icon={ faUpload } />
                {/if}
                <input 
                    class="hidden" 
                    type="file" 
                    name="file" 
                    
                    bind:this={ fileInput } 
                    on:change={ handleInputChange }
                />
            </button>
        </Dropzone>
        <div class="flex gap-8 pt-8 pb-2">
            <div class="flex items-baseline gap-2 text-xl">
                <Fa icon={ faDesktop }/>
                <Checkbox 
                    id="client"
                    name="client"
                />
            </div>
            <div class="flex items-baseline gap-2 text-xl">
                <Fa  icon={ faGlobe } />
                <Checkbox 
                    id="server"
                    name="server"
                />
            </div>
        </div>
        <div class="file-state flex-1 overflow-hidden flex pb-4">
            {#if fileState == 'invalid'}
                <h6>Fichier invalide</h6>
            {:else}
                <ul class="max-h-full flex flex-col px-2 gap-2 overflow-hidden overflow-y-scroll">
                    {#each files as file, i }
                        <li 
                            class="animation-delay"
                            style="--i:{i * 50}ms" 
                        >
                            { file.name }
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
        <div class="flex gap-4 py-8">
            <button type="submit" class="bg-green-700 px-4 rounded-md py-4 text-xl duration-150 hover:scale-110">Ajouter</button>
            <button type="button" class="bg-red-600 px-4 rounded-md py-4 text-xl duration-150 hover:scale-110" on:click={ handleCancel }>Annuler</button>
        </div>
    </form>
</div>

<style>
    .mod-menu {
        transition-duration: 500ms;
    }

    .mod-menu-open {
        width: 20rem;
        min-width: 20rem;
    }

    .mod-menu-close {
        width: 0rem;
        min-width: 0rem;
    }

    .file-state {
        transition-duration: 500ms;
    }

    .animation-delay {
        -webkit-animation: slide-in-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                animation: slide-in-left 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        animation-delay: var(--i);
    }
</style>