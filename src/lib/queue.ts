import type { Queue } from "./types";

export const queue: Queue = {
    cooldownStartTime: Date.now(),
    cooldown: 0,
    videos: []
};
