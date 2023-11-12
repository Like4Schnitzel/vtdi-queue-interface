import { maxQueueSize, queue, availableIDs } from "$lib/consts";
import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import { sha256 } from 'js-sha256';
import { somethingEmitter } from "$lib/server/createSSE";
import type { QueueInfo, YouTubeResponse } from "$lib/types";
import { fixedCooldown } from "$lib/consts";

export const GET: RequestHandler = async () => {
    return json(queue);
};

export const POST: RequestHandler = async ({ request }) => {
    const cooldown = (queue.cooldownStartTime - Date.now()) / 1000;
    if (cooldown > 0)
        return json({ status: 400, message: "Wait for the cooldown to end" });
    if (queue.videos.length >= maxQueueSize) {
        return json({ status: 400, message: "Queue already full" });
    }

    const body = await request.json();
    let res;
    try {
        res = await fetch(body.url);
    } catch {
        return json({ status: 502, message: "Request blocked" })
    }
    let infoJSON: YouTubeResponse;
    try {
        infoJSON = await res.json();
    } catch {
        return json({ status: 502, message: "Invalid URL" });
    }
    const idIndex = Math.floor(Math.random() * availableIDs.length);
    const id = availableIDs[idIndex];
    availableIDs.splice(idIndex, 1);
    const newQueueItem: QueueInfo = {
        url: body.baseURL,
        info: infoJSON,
        uniqueID: id,
        timeStartedPlaying: Date.now()
    };
    queue.videos.push(newQueueItem);
    queue.cooldownStartTime = Date.now() + fixedCooldown;
    somethingEmitter.emit('queueItemAdded', newQueueItem);
    return json({ status: 201 });
};

export const DELETE: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const pw: string = body.password;
    // sha256 hash of correct password is 8943da420286691033797a98fb0d57fd7596b56f419a2102d881777ba53b25ca
    if (sha256(pw) === "8943da420286691033797a98fb0d57fd7596b56f419a2102d881777ba53b25ca") {
        const indexToRemove = body.index;
        availableIDs.push(queue.videos[indexToRemove].uniqueID);
        queue.videos.splice(indexToRemove, 1);
        // gotta set the new first video of the queue to just having started playing
        if (indexToRemove === 0 && queue.videos[0]) {
            queue.videos[0].timeStartedPlaying = Date.now();
        }
        somethingEmitter.emit('queueItemRemoved', indexToRemove);
        return json({ status: 200 });
    }

    return json({ status: 403 });
};
