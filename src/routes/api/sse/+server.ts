import type { RequestHandler } from "./$types";
import { createSSE, somethingEmitter } from "$lib/server/createSSE";

export const GET: RequestHandler = async () => {
    const { readable, subscribeToEvent } = createSSE();
    subscribeToEvent(somethingEmitter , 'queueModified');
    subscribeToEvent(somethingEmitter , 'queueItemRemoved');
    subscribeToEvent(somethingEmitter, 'queueItemAdded');
    subscribeToEvent(somethingEmitter, 'progressUpdated');
    return new Response(readable, {
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'text/event-stream'
      }
    });
};
