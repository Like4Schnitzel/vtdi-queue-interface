import type { Queue } from "./types";

export const fixedCooldown = 5000;

export const maxQueueSize = 5;

export const queue: Queue = {
    cooldownStartTime: Date.now(),
    videos: []
};

export const availableIDs = [...Array(maxQueueSize).keys()];
