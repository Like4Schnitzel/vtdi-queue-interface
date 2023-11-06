<script lang="ts">
    import { queue } from "./stores";
</script>

<ul>
    {#each $queue as url}
        <li>url</li>
    {/each}
</ul>
