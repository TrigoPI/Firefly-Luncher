<script lang="ts">
    import { faBars, faFile, faPlay, faServer, faTerminal, faXmark } from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";
    import NavItem from "./nav-item.svelte";
    import { stateStore, type AppState } from "@lib/stores/state-store";

    export let online: boolean;

    let isMenuOpen: boolean = true;
    let hide: boolean = false;
    let itemSelected: string = "Luncher";

    stateStore.subscribe((value: AppState) => {
        if (value != "download") {
            hide = false;
        } else {
            isMenuOpen = false;
            hide = true;
        }
    });
</script>

{#if !isMenuOpen && !hide}    
    <button 
        class="p-4 absolute z-50 text-2xl opacity-30 duration-150 hover:opacity-100 text-white"
        on:click={ () => isMenuOpen = true }
    >
    <Fa icon={ faBars } />
    </button>
{/if}

<nav class="overflow-hidden z-10 h-full bg-neutral-950 {isMenuOpen? "open border-r border-neutral-800" : "close border-r border-transparent" }">
    <div class="flex justify-end {isMenuOpen? "opacity-100" : "opacity-0"}">
        <button 
            class="p-4 text-2xl opacity-30 duration-150 hover:opacity-100 text-white"
            on:click={ () => isMenuOpen = false }
        >
            <Fa icon={ faXmark } />
        </button>
    </div>
    <ul class="text-white flex flex-col gap-8 text-lg p-8">
        <NavItem 
            icon={ faPlay }
            text="Luncher"
            route="/"
            selected={ itemSelected == "Luncher" }
            onClick={ name => itemSelected = name }
        />
        {#if online}
            <NavItem 
                icon={ faServer }
                text="Serveur"
                route="/serveur"
                selected={ itemSelected == "Serveur" }
                onClick={ name => itemSelected = name }
            />
            <NavItem 
                icon={ faTerminal } 
                text="Console"
                route="/console"
                selected={ itemSelected == "Console" }
                onClick={ name => itemSelected = name }
            />
            <NavItem 
                icon={ faFile } 
                text="Mods"
                route="/mods"
                selected={ itemSelected == "Mods" }
                onClick={ name => itemSelected = name }
            />
        {/if}
    </ul>
</nav>

<style>
    nav {
        transition-duration: 500ms;
    }

    .open {
        min-width: 20rem;
        width: 20rem;
    }

    .close {
        min-width: 0;
        width: 0;
    }
</style>