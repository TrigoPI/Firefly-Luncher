<script lang="ts">
    import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";

    export let icon: IconDefinition;
    export let text: string;
    export let route: string;
    export let selected: boolean;
    export let onClick: (name: string) => void;
</script>

<li>
    <a href={ route } class="flex items-center gap-4" on:click={ () => onClick(text) }>
        <Fa icon={ icon } />
        <span>{ text }</span>
    </a>
    <div class={ selected? "selected" : "" }></div>
</li>

<style>
    li > div {
        width: 0;
        height: 1px;
        background-color: white;
        margin-top: 3px;
        transition: 200ms;
    }

    li:hover > div {
        width: 100%;
    }

    .selected {
        width: 100%;
    }
</style>