import { writable } from "svelte/store";
import type { Queue, QueueInfo } from "./types";

function createQueue() {
    const { subscribe, set, update } = writable<Queue>({cooldownStartTime: Date.now(), cooldown: 0, videos: []});

    return {
        subscribe,
        add: ((url: QueueInfo) => update((cq) => {
            cq.videos.push(url);
            return cq;
        })),
        set: ((qis: Queue) => update(() => {
            return qis;
        })),
        remove: ((index: number) => update((cq) => {
            cq.videos.splice(index, 1);
            return cq;
        }))
    }
}

export const localQueue = createQueue();
