<script lang="ts">
    import { onMount } from "svelte";
    import { localQueue } from "$lib/stores";
    
    let pw: string = "";
    let source: EventSource;

    onMount(async () => {
        localQueue.set(await (await fetch('/queue')).json());

        source = new EventSource('/api/sse', {
            withCredentials: false
        });
        source.addEventListener('queueModified', async (e) => {
            localQueue.set(await (await fetch('/queue')).json());
        });
    });

    const deleteFromQueue = async (i: number) => {
        await fetch ('/queue', {
            method: 'DELETE',
            body: JSON.stringify({
                password: pw,
                index: i
            })
        });
    };
</script>

<head>
    <link rel='icon' href="favicon.png">
</head>

<body>
    <div class="passwordField">
        <p>Password: </p>
        <input bind:value={pw} type="text"/>
    </div>
    <ol>
        {#each $localQueue as queueElem, i}
            <div class="line">
                <li>{queueElem.url}</li>
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <img src="x.svg" alt="red x" title="delete from queue" on:click={() => {deleteFromQueue(i)}}/>
            </div>
        {/each}
    </ol>
</body>

<style>
    :root {
        background-color: rgb(86, 90, 94);
    }

    .passwordField p {
        width: fit-content;
        display: inline;
    }

    .line {
        height: 2rem;
        display: flex;
        align-items: center;
    }

    .line li {
        font-size: 1.3rem;
        width: fit-content;
        display: inline-block;
        margin-right: 1%;
    }

    .line img {
        height: 100%;
        display: inline;
    }
</style>
