<script lang="ts">
    import { queue } from "./stores";

    function lstrip(s: string, characters: string) {
        let start = 0;
        while (characters.indexOf(s[start]) >= 0) {
            start += 1;
        }
        let end = s.length - 1;
        return s.substring(start, end);
    }


    const processInput = () => {
        // make sure there's https:// as a prefix
        const httpsInputText = "https://" + lstrip(inputText, "https://");
        const inputURL = new URL(httpsInputText);
        const inputURLParts = inputURL.hostname.split('.');
        const partsCount = inputURLParts.length;

        if (inputURL && inputURLParts[partsCount-2] + "." + inputURLParts[partsCount-1] === "youtube.com")
        {
            queue.add(inputURL);
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
