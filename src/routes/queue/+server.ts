import { queue } from "$lib/queue";
import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";
import { sha256 } from 'js-sha256';

export const GET: RequestHandler = async () => {
    return json(queue);
};

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    queue.push(body);
    return json({ status: 201 });
};

export const PATCH: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const pw: string = body['password'];
    // sha256 hash of correct password is 90d9e6c2489d8a428f403f2d01f406146946bf3699039a3763a2601226c47429
    if (sha256(pw) === "90d9e6c2489d8a428f403f2d01f406146946bf3699039a3763a2601226c47429") {
        return json({ status: 200 });
    }

    return json({ status: 403 });
};
