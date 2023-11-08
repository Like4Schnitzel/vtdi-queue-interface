<script lang="ts">
    import { localQueue } from "./stores";
</script>

<ul>
    {#each $localQueue as elem}
        <li>{elem.url}</li>
    {/each}
</ul>
