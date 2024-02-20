<script lang="ts">
    import { faPen, type IconDefinition } from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";

    export let title: string;
    export let data: string;
    export let icon: IconDefinition; 

</script>

<div class="relative flex flex-col items-center gap-4 rounded-md px-12 py-8 cursor-pointer duration-150 hover:scale-105 hover:shadow-md bg-neutral-800">
    <div class="edit absolute">
        <Fa icon={ faPen } />
    </div>
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

<style>
    .edit {
        top: 1.3rem;
        left: 92%;
        transform: translate(-50%, -50%);
        color: white;
        opacity: 0;
        transition-duration: 150ms;
    }

    div:hover > .edit {
        opacity: 0.5;
    }
</style>