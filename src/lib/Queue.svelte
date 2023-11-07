<script lang="ts">
    import { queue } from "./stores";
</script>

<ul>
    {#each $queue as elem}
        <li>{elem.url}</li>
    {/each}
</ul>
