<script lang="ts">
    import { localQueue } from "./stores";
</script>

{#if $localQueue.length > 0}
    {@html $localQueue[0].info.html}
{/if}
