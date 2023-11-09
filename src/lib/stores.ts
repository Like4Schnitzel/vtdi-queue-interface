import { writable } from "svelte/store";
import type { QueueInfo } from "./types";

function createQueue() {
    const { subscribe, set, update } = writable<QueueInfo[]>([]);

    return {
        subscribe,
        add: ((url: QueueInfo) => update((cq) => {
            cq.push(url);
            return cq;
        })),
        set: ((qis: QueueInfo[]) => update(() => {
            return qis;
        })),
        remove: ((index: number) => update((cq) => {
            cq.splice(index, 1);
            return cq;
        }))
    }
}

export const localQueue = createQueue();
