<script lang="ts">
    import { onMount } from "svelte";
    import { localQueue } from "$lib/stores";
    
    let pw: string = "";

    onMount(async () => {
        localQueue.set(await (await fetch('/queue')).json());
    });

    const deleteFromQueue = async (i: number) => {
        const response = await fetch ('/queue', {
            method: 'DELETE',
            body: JSON.stringify({
                password: pw,
                index: i
            })
        });
        const status = (await response.json()).status;

        if (status === 200) {
            localQueue.remove(i);
        }
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
    }

    .line li {
        font-size: 1rem;
        width: fit-content;
        display: inline-block;
    }

    .line img {
        height: 100%;
        display: inline;
    }
</style>
