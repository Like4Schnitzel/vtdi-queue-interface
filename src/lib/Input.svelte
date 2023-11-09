<script lang="ts">
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
        let inputURL: URL;
        try {
            inputURL = new URL(httpsInputText);
        } catch {
            validURL = false;
            return;
        }

        // at this point we know it's a valid URL
        const id: string = inputURL.searchParams.get("v") || inputURL.pathname.substring(1);
        inputURL = new URL(`https://www.youtube.com/watch?v=${id}`);

        if (inputURL) {
            const requestURL = new URL(`https://www.youtube.com/oembed?url=${inputURL}&format=json`);
            const response = await fetch('/queue', {
                method: 'POST',
                body: JSON.stringify({
                    url: requestURL,
                    baseURL: inputURL
                })
            });
            const result = await response.json();
            if (result.status === 502) {
                validURL = false;
                return;
            }
            // else the status is 201

            validURL = true;
            inputElement.value = '';
        }
        else {
            validURL = false;
        }
    };

    let inputText: string;
    let inputElement: HTMLInputElement;
    let validURL = true;
</script>

<div class="biggerContainer">
    <div class="container">
        <input bind:value={inputText} bind:this={inputElement} on:keydown={async (e) => {
            if (e.key === 'Enter') {
                processInput();
            }
        }}/>
        <button on:focus={processInput}>Submit</button>
    </div>
    {#if !validURL}
        <p class="error">ERROR: Invalid URL</p>
    {/if}
</div>

<style>
    .biggerContainer {
        width: 25%;
    }

    .container {
        display: flex;
        gap: 1rem;
    }

    .container input {
        flex-basis: 80%;
    }

    .container button {
        flex-basis: 20%;
    }

    .error {
        color: red;
        margin-bottom: auto;
        margin-top: 0;
        width: fit-content;
    }
</style>
