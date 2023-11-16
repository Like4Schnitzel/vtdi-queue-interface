<script lang="ts">
    import Input from "$lib/Input.svelte";
    import Queue from "$lib/Queue.svelte";
    import Display from "$lib/Display.svelte";
    import { localQueue, cooldown } from "$lib/stores";
    import { onMount } from "svelte";
    import { fixedCooldown } from "$lib/consts";

    let source: EventSource;
    onMount(async () => {
        localQueue.set(await (await fetch('./queue')).json())

        source = new EventSource('./api/sse', {
            withCredentials: false
        });
        source.addEventListener('queueModified', async (e) => {
            localQueue.set(JSON.parse(e.data));
        });
        source.addEventListener('queueItemRemoved', async (e) => {
            const index = JSON.parse(e.data);
            if (index === 0 && $localQueue.videos[1]) {
                $localQueue.videos[1].timeStartedPlaying = Date.now();
            }
            localQueue.remove(index);
        });
        source.addEventListener('queueItemAdded', async (e) => {
            localQueue.add(JSON.parse(e.data));
            $localQueue.cooldownStartTime = Date.now() + fixedCooldown;
            cooldown.update($localQueue.cooldownStartTime);
        });
        source.addEventListener('progressUpdated', async (e) => {
            const info = JSON.parse(e.data);
            $localQueue.videos[info.index].transcodeProgress = info.newProgress;
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
