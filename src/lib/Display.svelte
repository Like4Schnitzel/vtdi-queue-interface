<script lang="ts">
    import { afterUpdate } from "svelte";
    import { localQueue } from "./stores";
    import type { QueueInfo } from "./types";

    let currentlyPlaying: QueueInfo | undefined = undefined;
    let playerElem: any;
    let playerContainer: HTMLDivElement;

    const stringToHTMLElement = (str: string) => {
        const div = document.createElement('div');
        div.innerHTML = str.trim();
        return div.firstChild;
    };

    afterUpdate(() => {
        if ($localQueue.videos[0] !== undefined && currentlyPlaying?.uniqueID !== $localQueue.videos[0].uniqueID) {
            currentlyPlaying = $localQueue.videos[0];

            playerElem = stringToHTMLElement(currentlyPlaying.info.html);
            const timeElapsedSinceAdded = (Date.now() - $localQueue.videos[0].timeStartedPlaying) / 1000;
            playerElem.src += `&start=${Math.round(timeElapsedSinceAdded)}&autoplay=1`;
            if (playerContainer.firstChild) {
                playerContainer.removeChild(playerContainer.firstChild);
            }
            playerContainer.appendChild(playerElem);
        } else if ($localQueue.videos[0] === undefined && playerContainer.firstChild) {
            playerContainer.removeChild(playerContainer.firstChild);
        }
    });
</script>

<div class="playerDiv" bind:this={playerContainer}>
    <!--iframe goes here-->
</div>

<style>
    .playerDiv {
        pointer-events: none;
    }
</style>
