import { randomUUID } from 'node:crypto';
let revision = randomUUID();
const waiting = new Set();
export function publishLiveChange() {
    revision = randomUUID();
    for (const notify of waiting)
        notify();
}
export function waitForLiveChanges(req, res) {
    res.set('Cache-Control', 'no-store');
    if (req.query.since !== revision) {
        res.json({ revision });
        return;
    }
    const cleanup = () => {
        clearTimeout(timer);
        waiting.delete(send);
        res.off('close', cleanup);
    };
    const send = () => {
        cleanup();
        res.json({ revision });
    };
    const timer = setTimeout(send, 20_000);
    waiting.add(send);
    res.once('close', cleanup);
}
