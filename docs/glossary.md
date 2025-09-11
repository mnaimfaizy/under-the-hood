# Glossary

Kid Mode (simple metaphors):

- Call Stack: the slide queue (one kid at a time)
- Web APIs: helper robots doing tasks
- Microtask Queue: VIP fast lane
- Macrotask Queue: regular line
- Event Loop: the gatekeeper checking the slide is free

Pro Mode (technical):

- Call Stack: LIFO stack of executing frames
- Web APIs: host-provided async facilities (Timers, Fetch, DOM)
- Microtask Queue: jobs queue (Promises/queueMicrotask) drained after sync
- Macrotask Queue: task queue (setTimeout, I/O callbacks)
- Event Loop: scheduler that runs sync, drains microtasks, then one macrotask per tick
