import { writable } from "svelte/store";
import type { Queue, QueueInfo } from "./types";
import { fixedCooldown } from "./consts";

function createQueue() {
    const { subscribe, set, update } = writable<Queue>({cooldownStartTime: Date.now(), videos: []});

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

function createCooldown() {
    const { subscribe, set, update } = writable<number>(fixedCooldown);

    return {
        subscribe,
        update: ((startTime: number) => update(() => {
            const temp = (startTime - Date.now()) / 1000;
            if (temp < 0) return 0;
            return temp;
        }))
    }
}

export const localQueue = createQueue();

export const cooldown = createCooldown();
