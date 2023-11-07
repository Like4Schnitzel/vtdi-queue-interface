<script lang="ts">
    import { queue } from "./stores";
    import type { YouTubeResponse } from "./types";

    function lstrip(s: string, characters: string) {
        let start = 0;
        while (characters.indexOf(s[start]) >= 0) {
            start += 1;
        }
        return s.substring(start);
    }


    const processInput = async () => {
        // make sure there's https:// as a prefix
        const httpsInputText = "https://" + lstrip(inputText, "https://");
        const inputURL = new URL(httpsInputText);

        if (inputURL)
        {
            const requestURL = `https://www.youtube.com/oembed?url=${inputURL}&format=json`;
            console.log(requestURL);
            const request = new Request(requestURL);
            const res = await fetch(request);
            const infoJSON: YouTubeResponse = await res.json();

            queue.add({
                url: httpsInputText,
                info: infoJSON
            });
        }
    }

    let inputText: string;
</script>

<div class="container">
    <input bind:value={inputText}/>
    <button on:focus={processInput}>Submit</button>
</div>

<style>
    .container {
        display: flex;
        gap: 1rem;
        width: 20%;
    }

    .container input {
        flex-basis: auto;
    }

    .container button {
        flex-basis: 20%;
    }
</style>
