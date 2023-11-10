import type { Queue } from "./types";

export const queue: Queue = {
    cooldownStartTime: Date.now(),
    videos: []
};
