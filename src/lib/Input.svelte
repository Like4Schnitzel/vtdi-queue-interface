<script lang="ts">
    import { maxHeight, maxWidth } from "./consts";
    import { cooldown } from "./stores";

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
            errorMessage = "Invalid URL";
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
                    method: 'queueItem',
                    url: requestURL,
                    baseURL: inputURL,
                    width: inputWidth,
                    height: inputHeight
                })
            });
            const result = await response.json();
            if (result.status !== 201) {
                validURL = false;
                errorMessage = result.message;
                return;
            }
            // else

            validURL = true;
            inputText = '';
            inputWidth = null;
            inputHeight = null;
        }
        else {
            validURL = false;
            errorMessage = "Invalid URL";
        }
    };

    let inputText: string;
    let inputWidth: number | null;
    let inputHeight: number | null;
    let validURL = true;
    let errorMessage: string;
</script>

<div class="biggerContainer">
    <div class="container">
        <input bind:value={inputText} on:keydown={async (e) => {
            if (e.key === 'Enter') {
                processInput();
            }
        }}/>
        <div class="dimensionsInputs">
            <input bind:value={inputWidth} type="number" max={maxWidth} min=0
            on:keydown={async (e) => {
                if (e.key === 'Enter') {
                    processInput();
                }
            }}/>
            <p>x</p>
            <input bind:value={inputHeight} type="number" max={maxHeight} min=0
            on:keydown={async (e) => {
                if (e.key === 'Enter') {
                    processInput();
                }
            }}/>
        </div>
        <button on:click={processInput}>Submit</button>
        <p>
            Cooldown: {Math.round($cooldown)}
        </p>
    </div>
    {#if !validURL}
        <p class="error">ERROR: {errorMessage}</p>
    {/if}
</div>

<style>
    .biggerContainer {
        width: fit-content;
    }
    
    .container {
        display: flex;
        gap: 1rem;
        align-items: center;
    }
    
    .dimensionsInputs {
        display: flex;
        width: 20%;
    }

    .dimensionsInputs input {
        width: 50%;
    }

    .container p {
        white-space: nowrap;
        margin: 0;
    }

    .error {
        color: red;
        margin-bottom: auto;
        margin-top: 0;
        width: fit-content;
    }
</style>
