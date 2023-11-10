import { queue } from "$lib/queue";
import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import { sha256 } from 'js-sha256';
import { somethingEmitter } from "$lib/server/createSSE";
import type { YouTubeResponse } from "$lib/types";
import { cooldown } from "$lib/consts";

export const GET: RequestHandler = async () => {
    queue.cooldown = (queue.cooldownStartTime - Date.now()) / 1000;
    if (queue.cooldown < 0) queue.cooldown = 0;
    return json(queue);
};

export const POST: RequestHandler = async ({ request }) => {
    queue.cooldown = (queue.cooldownStartTime - Date.now()) / 1000;
    if (queue.cooldown > 0)
        return json({ status: 400, message: "Wait for the cooldown to end" });
    if (queue.videos.length >= 5) {
        return json({ status: 400, message: "Queue already full" });
    }

    const body = await request.json();
    const baseURL = body.baseURL;
    const url = body.url;
    const req = new Request(url);
    const res = await fetch(req);
    let infoJSON: YouTubeResponse;
    try {
        infoJSON = await res.json();
    } catch {
        return json({ status: 502, message: "Invalid URL" });
    }
    queue.videos.push({
        url: baseURL,
        info: infoJSON
    });
    queue.cooldownStartTime = Date.now() + cooldown;
    somethingEmitter.emit('queueModified');
    return json({ status: 201 });
};

export const DELETE: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const pw: string = body.password;
    // sha256 hash of correct password is 8943da420286691033797a98fb0d57fd7596b56f419a2102d881777ba53b25ca
    if (sha256(pw) === "8943da420286691033797a98fb0d57fd7596b56f419a2102d881777ba53b25ca") {
        const indexToRemove = body.index;
        queue.videos.splice(indexToRemove, 1);
        somethingEmitter.emit('queueModified');
        return json({ status: 200 });
    }

    return json({ status: 403 });
};
