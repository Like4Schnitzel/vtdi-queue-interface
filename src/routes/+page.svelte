<script lang="ts">
    import Input from "$lib/Input.svelte";
    import Queue from "$lib/Queue.svelte";
    import Display from "$lib/Display.svelte";
    import { localQueue } from "$lib/stores";
    import { onDestroy, onMount } from "svelte";

    let source: EventSource;
    onMount(async () => {
        localQueue.set(await (await fetch('/queue')).json())

        source = new EventSource('/api/sse', {
            withCredentials: false
        });
        source.addEventListener('queueModified', async (e) => {
            localQueue.set(await (await fetch('/queue')).json());
        });
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
