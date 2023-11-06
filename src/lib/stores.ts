import { writable } from "svelte/store";

function createQueue() {
    const { subscribe, set, update } = writable<URL[]>([]);

    return {
        subscribe,
        add: ((url: URL) => update((cq) => {
            cq.push(url);
            return cq;
        }))
    }
}

export const queue = createQueue();
