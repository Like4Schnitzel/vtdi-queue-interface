<script lang="ts">
    import { localQueue } from "./stores";
</script>

<ul>
    {#each $localQueue.videos as elem}
        <li>{elem.info.title} ({elem.width}x{elem.height}) [{elem.transcodeProgress}%]</li>
    {/each}
</ul>
