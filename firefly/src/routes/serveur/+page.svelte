<script lang="ts">
    import { onMount } from "svelte";
    import { DataSnapshot, onValue } from "firebase/database";
    import { faComputer, faGaugeHigh, faHashtag, faPlay, faSpinner, faStop, faUserGroup, faWrench } from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa"
    
    import type { ServerState } from "shared/types/minecraft";
    import ServerInfo from "./server-info.svelte";
    
    import url from "@conf/url.json";
    import RestClient from "@lib/rest-client/RestClient";
    import { Firebase } from "@lib/utils/firebase";
    import { popupMessage } from "@lib/stores/popup-store";
    import type HttpErrorException from "@lib/rest-client/Exception";

    let serverState: ServerState = 'loading';
    let properties: Record<string, any> = {};

    const handleButtonClick = async (state: ServerState): Promise<void> => {
        let err: HttpErrorException | undefined = undefined;
        let _: any = undefined;

        if (state == 'stopped') [_, err] = await RestClient.Post(`${url.api}/server/start`);
        if (state == 'running') [_, err] = await RestClient.Post(`${url.api}/server/stop`);
        
        if (err) {
            popupMessage.update((value: string[]) => [ `Une erreur est survenue : \r\n${err}`, ...value]);
            return;
        }
        
        serverState = 'loading';
    }

    onValue(Firebase.SERVER_STATE_REF, (snapshot: DataSnapshot) => {
        const val: Record<string, any> = snapshot.val();
        serverState = val.state;
    });

    onMount(async () => {
        const [res, err] = await RestClient.Get(`${url.api}/server/properties`);
        
        if (err) {
            popupMessage.update((value: string[]) => [ `Une erreur est survenue : \r\n${err}`, ...value]);
            return;
        }

        properties =  res.Json();
    });
</script>

<div class="w-full overflow-hidden flex text-white">
    <div class="w-full flex px-28 gap-16 py-4">
        <div class="px-20">
            {#if serverState == 'stopped'}
                <button class="w-56 h-28 flex items-center justify-center gap-4 sticky top-4 text-4xl rounded-sm duration-150 hover:scale-110 bg-green-700" on:click={ () => handleButtonClick('stopped') }>
                    <Fa icon={ faPlay } />
                    <span>START</span>
                </button>
            {/if}
            {#if serverState == 'loading'}
                <button class="w-56 h-28 flex items-center justify-center sticky top-4 text-4xl rounded-sm duration-150 hover:scale-110 bg-orange-700">
                    <Fa icon={ faSpinner } spin={ true } />
                </button>
            {/if}
            {#if serverState == 'running'}
                <button class="w-56 h-28 flex items-center justify-center gap-4 sticky top-4 text-4xl rounded-sm duration-150 hover:scale-110 bg-red-700" on:click={ () => handleButtonClick('running') }>
                    <Fa icon={ faStop } />
                    <span>STOP</span>
                </button>
            {/if}
        </div>
        <div class="card-table overflow-hidden overflow-y-scroll flex-1 p-2">
            <ServerInfo 
                title="IP"
                data={ properties["server-ip"] }
                icon={ faComputer }
            />
            <ServerInfo 
                title="PORT"
                data={ properties["server-port"] }
                icon={ faHashtag }
            />
            <ServerInfo 
                title="JOUERS"
                data="0/{ properties["max-players"] }"
                icon={ faUserGroup }
            />
            <ServerInfo 
                title="DIFFICULTY"
                data={ properties["difficulty"] }
                icon={ faGaugeHigh }
            />
            <ServerInfo 
                title="GAMEMODE"
                data={ properties["gamemode"] }
                icon={ faWrench }
            />
        </div>
    </div>
</div>

<style>
    .card-table {
        display: grid;
        grid-template-columns: repeat(auto-fill, 15rem);
        grid-auto-rows: 12rem;
        gap: 1rem;
    }
</style>