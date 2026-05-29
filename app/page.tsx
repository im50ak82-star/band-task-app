"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { db } from "../firebase";

import {
collection,
addDoc,
onSnapshot,
deleteDoc,
doc,
} from "firebase/firestore";

export default function Home() {
const [events, setEvents] = useState<
{
id: string;
name: string;
}[]
>([]);

const [newEvent, setNewEvent] =
useState("");

// Firestore同期
useEffect(() => {
const unsubscribe =
onSnapshot(
collection(db, "events"),
(snapshot) => {
const eventsData =
snapshot.docs.map(
(doc) => ({
id: doc.id,
name:
doc.data().name,
})
);

setEvents(eventsData);
}
);

return () => unsubscribe();
}, []);

// イベント追加
const addEvent = async () => {
if (
newEvent.trim() === ""
)
return;

await addDoc(
collection(db, "events"),
{
name: newEvent,
}
);

setNewEvent("");
};

// イベント削除
const deleteEvent = async (
id: string
) => {
await deleteDoc(
doc(db, "events", id)
);
};

return (
<main className="flex h-screen flex-col overflow-hidden bg-gray-50 p-4">
<h1 className="mb-6 text-3xl font-bold text-black">
FPWE tasks
</h1>

<div className="mb-6 flex items-center gap-2">
<input
value={newEvent}
onChange={(e) =>
setNewEvent(
e.target.value
)
}
onKeyDown={(e) => {
if (
e.key === "Enter"
) {
addEvent();
}
}}
placeholder="イベント名"
className="flex-1 rounded-2xl border bg-white p-4 text-black outline-none"
/>

<button
type="button"
onClick={() => {
addEvent();
}}
className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-3xl text-white active:scale-95"
>
＋
</button>
</div>

<div className="grid flex-1 grid-cols-3 gap-2 overflow-y-auto pb-24">
{events.map((event) => (
<div
key={event.id}
className="relative"
>
<Link
href={`/${event.name}`}
className="flex aspect-square items-end overflow-hidden rounded-3xl bg-white p-2 shadow transition-all duration-300 active:scale-95"
>
<h2 className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-black">
{event.name}
</h2>
</Link>

<button
onClick={() =>
deleteEvent(
event.id
)
}
className="absolute right-1 top-1 text-xs text-red-500"
>
✕
</button>
</div>
))}
</div>
</main>
);
}