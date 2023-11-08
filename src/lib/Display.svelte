<script lang="ts">
    import { queue } from "./stores";
</script>

{#if $queue.length > 0}
    {@html $queue[0].info.html}
{/if}
