<script lang="ts">
    import Input from "$lib/Input.svelte";
    import Queue from "$lib/Queue.svelte";
    import Display from "$lib/Display.svelte";
    import { localQueue, cooldown } from "$lib/stores";
    import { onMount } from "svelte";

    let source: EventSource;
    onMount(async () => {
        localQueue.set(await (await fetch('/queue')).json())

        source = new EventSource('/api/sse', {
            withCredentials: false
        });
        source.addEventListener('queueModified', async (e) => {
            localQueue.set(JSON.parse(e.data));
        });
        source.addEventListener('queueItemRemoved', async (e) => {
            localQueue.remove(JSON.parse(e.data));
        });
        source.addEventListener('queueItemAdded', async (e) => {
            localQueue.add(JSON.parse(e.data));
        });

        setInterval(() => {
            cooldown.update($localQueue.cooldownStartTime);
        }, 1000)
    });
</script>

<head>
    <link rel='icon' href="favicon.png">
</head>

<body>
    <Input />
    <Queue />
    <Display />
</body>

<style>
    body {
        height: 100%;
        background-attachment: fixed;
        background-repeat: no-repeat;
        background-image: linear-gradient(#00d9ff, #fe00ff);
    }
</style>
