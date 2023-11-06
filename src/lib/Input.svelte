<script lang="ts">
    import { queue } from "./stores";

    const processInput = () => {
        const inputURL = new URL(inputText);

        if (inputURL)
            queue.add(inputURL);
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
