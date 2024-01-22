<script lang="ts">
    import { faUser, type IconDefinition } from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";

    export let title: string;
    export let data: string;
    export let icon: IconDefinition; 

</script>

<div class="flex flex-col items-center gap-4 rounded-md px-12 py-8 bg-neutral-800">
    <div class="px-4 text-2xl border-b border-neutral-700">
        <h1>{ title }</h1>
    </div>
    <div class="text-3xl">
        <Fa icon={ icon } />
    </div>
    <div class="text-lg">
        <h1>{ data }</h1>
    </div>
</div>