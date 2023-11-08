import { queue } from "$lib/queue";
import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
    return json(queue);
};

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    queue.push(body);
    return json(queue);
};
