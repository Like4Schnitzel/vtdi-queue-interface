<script lang="ts">
    import { afterUpdate, onMount } from "svelte";
    import { localQueue } from "./stores";
    import type { QueueInfo } from "./types";

    let currentlyPlaying: QueueInfo | undefined = undefined;
    let playerElem: any;
    let playerContainer: HTMLDivElement;
    let source: EventSource;

    const stringToHTMLElement = (str: string) => {
        const div = document.createElement('div');
        div.innerHTML = str.trim();
        return div.firstChild;
    };

    onMount(() => {
        source = new EventSource('./api/sse', {
            withCredentials: false
        });
        source.addEventListener('playVideo', () => {
            $localQueue.videos[0].timeStartedPlaying = Date.now();
        });
    });

    afterUpdate(() => {
        if ($localQueue.videos[0] !== undefined && $localQueue.videos[0].transcodeProgress === 100 && currentlyPlaying?.uniqueID !== $localQueue.videos[0].uniqueID) {
            currentlyPlaying = $localQueue.videos[0];

            playerElem = stringToHTMLElement(currentlyPlaying.info.html);
            const timeElapsedSinceAdded = (Date.now() - $localQueue.videos[0].timeStartedPlaying) / 1000;
            playerElem.src += `&start=${Math.round(timeElapsedSinceAdded)}&autoplay=1`;
            playerElem.width = "";
            playerElem.height = "";
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
        position: relative;
        display: block;
        width: 90%;
        height: 0;
        margin: auto;
        padding: 0% 0% 56.25%;  /* 16:9 ratio */
        overflow: hidden;
    }

    :global(.playerDiv iframe) {
        position: absolute;
        top: 0; bottom: 0; left: 0;
        width: 100%;
        height: 100%;
        border: 0;
    }
</style>
