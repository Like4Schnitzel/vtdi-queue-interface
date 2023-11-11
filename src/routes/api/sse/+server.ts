import type { RequestHandler } from "./$types";
import { createSSE, somethingEmitter } from "$lib/server/createSSE";

export const GET: RequestHandler = async () => {
    const { readable, subscribeToEvent } = createSSE();
    subscribeToEvent(somethingEmitter , 'queueModified');
    subscribeToEvent(somethingEmitter , 'queueItemRemoved');
    subscribeToEvent(somethingEmitter, 'queueItemAdded');
    return new Response(readable, {
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'text/event-stream'
      }
    });
};
