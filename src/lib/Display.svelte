<script lang="ts">
    import { afterUpdate } from "svelte";
    import { localQueue } from "./stores";

    afterUpdate(() => {
        const player = document.querySelector('iframe');

        if (player) {
            player.src += '&autoplay=1';
        }
    });
</script>

{#if $localQueue.videos.length > 0}
    {@html $localQueue.videos[0].info.html}
{/if}
