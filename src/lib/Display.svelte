<script lang="ts">
    import { afterUpdate } from "svelte";
    import { localQueue } from "./stores";
    import type { QueueInfo } from "./types";
    import { browser } from "$app/environment";

    let currentlyPlaying: QueueInfo | undefined = undefined;

    afterUpdate(() => {
        if ($localQueue.videos[0] !== undefined && currentlyPlaying?.uniqueID !== $localQueue.videos[0].uniqueID) {
            currentlyPlaying = $localQueue.videos[0];

            const searchFor = "src=\"";
            const srcStartPos = currentlyPlaying.info.html.indexOf(searchFor) + searchFor.length;
            const srcEndPos = currentlyPlaying.info.html.indexOf("\"", srcStartPos);
            currentlyPlaying.info.html = currentlyPlaying.info.html.substring(
                0, srcEndPos
            ) + "&autoplay=1" + "\"" + currentlyPlaying.info.html.substring(
                srcEndPos + 1
            );
        }
    });
</script>

{#if currentlyPlaying !== undefined}
    {@html currentlyPlaying.info.html}
{/if}
