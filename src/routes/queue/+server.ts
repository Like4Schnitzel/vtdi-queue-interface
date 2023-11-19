import { maxQueueSize, queue, availableIDs, maxWidth, maxHeight } from "$lib/consts";
import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import { sha256 } from 'js-sha256';
import { somethingEmitter } from "$lib/server/createSSE";
import type { QueueInfo, YouTubeResponse } from "$lib/types";
import { fixedCooldown } from "$lib/consts";

let prevQueueIndex: number | null = 0;

export const GET: RequestHandler = async () => {
    return json(queue);
};

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    if (body.method === "queueItem") {
        const cooldown = (queue.cooldownStartTime - Date.now()) / 1000;
        if (cooldown > 0)
            return json({ status: 400, message: "Wait for the cooldown to end" });
        if (queue.videos.length >= maxQueueSize) {
            return json({ status: 400, message: "Queue already full" });
        }
        if (!body.width) {
            return json({ status: 400, message: "Width not specified" });
        }
        if (body.width > maxWidth) {
            return json({ status: 400, message: "Width too big" });
        }
        if (!body.height) {
            return json({ status: 400, message: "Height not specified" });
        }
        if (body.height > maxHeight) {
            return json({ status: 400, message: "Height too big" });
        }

        const requestURL = new URL(`https://www.youtube.com/oembed?url=${body.baseURL}&format=json`);
        let res;
        try {
            res = await fetch(requestURL);
        } catch {
            return json({ status: 502, message: "Request blocked" })
        }
        let infoJSON: YouTubeResponse;
        try {
            infoJSON = await res.json();
        } catch {
            return json({ status: 502, message: "Invalid URL" });
        }

        // check that the video isn't already in the queue
        for (const elem of queue.videos) {
            if (elem.info.html === infoJSON.html) {
                return json({ status: 400, message: "Video already in queue" });
            }
        }

        const idIndex = Math.floor(Math.random() * availableIDs.length);
        const id = availableIDs[idIndex];
        availableIDs.splice(idIndex, 1);
        const newQueueItem: QueueInfo = {
            url: body.baseURL,
            info: infoJSON,
            uniqueID: id,
            timeStartedPlaying: Date.now(),
            width: body.width,
            height: body.height,
            transcodeProgress: 0
        };
        queue.videos.push(newQueueItem);
        queue.cooldownStartTime = newQueueItem.timeStartedPlaying + fixedCooldown;
        somethingEmitter.emit('queueItemAdded', newQueueItem);
        return json({ status: 201 });

    } else if (body.method === "updateProgress") {
        if (sha256(body.password) === "8943da420286691033797a98fb0d57fd7596b56f419a2102d881777ba53b25ca") {
            // check if we can reuse prevQueueIndex
            if (!prevQueueIndex || !queue.videos[prevQueueIndex] || queue.videos[prevQueueIndex].uniqueID !== body.uniqueID) {
                prevQueueIndex = null;
                // if not, set it to the new index
                for (let i = 0; i < queue.videos.length; i++) {
                    if (queue.videos[i].uniqueID === body.uniqueID) {
                        prevQueueIndex = i;
                        break;
                    }
                }

                // if the video has been removed from the queue entirely, send back a 410 GONE
                if (prevQueueIndex === null) {
                    return json({ status: 410 });
                }
            }

            queue.videos[prevQueueIndex].transcodeProgress = body.progress;
            somethingEmitter.emit('progressUpdated', {
                index: prevQueueIndex,
                newProgress: body.progress
            });
            if (prevQueueIndex === 0 && body.progress === 100) {
                queue.videos[0].timeStartedPlaying = Date.now();
                somethingEmitter.emit('playVideo');
            }
            return json({ status: 200 });
        }

        return json({ status: 403 });
    }

    return json({ status: 500, message: "Unknown method" });
};

export const DELETE: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const pw: string = body.password;
    // sha256 hash of correct password is 8943da420286691033797a98fb0d57fd7596b56f419a2102d881777ba53b25ca
    if (sha256(pw) === "8943da420286691033797a98fb0d57fd7596b56f419a2102d881777ba53b25ca") {
        const indexToRemove = body.index;
        availableIDs.push(queue.videos[indexToRemove].uniqueID);
        queue.videos.splice(indexToRemove, 1);
        somethingEmitter.emit('queueItemRemoved', indexToRemove);
        // gotta set the new first video of the queue to just having started playing
        if (indexToRemove === 0 && queue.videos[0] && queue.videos[0].transcodeProgress === 100) {
            queue.videos[0].timeStartedPlaying = Date.now();
            somethingEmitter.emit('playVideo');
        }
        return json({ status: 200 });
    }

    return json({ status: 403 });
};
