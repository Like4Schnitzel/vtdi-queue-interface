import type { Queue } from "./types";

export const fixedCooldown = 30 * 1000;

export const maxQueueSize = 5;

export const queue: Queue = {
    cooldownStartTime: Date.now(),
    videos: []
};

export const availableIDs = [...Array(maxQueueSize).keys()];

export const maxWidth = 150;

export const maxHeight = 50;
