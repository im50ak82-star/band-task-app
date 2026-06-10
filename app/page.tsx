"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { db } from "../firebase";

import {
collection,
addDoc,
onSnapshot,
deleteDoc,
doc,
updateDoc,
getDocs,
getDoc,
setDoc,
} from "firebase/firestore";

import {
DndContext,
closestCenter,
PointerSensor,
useSensor,
useSensors,
} from "@dnd-kit/core";

import {
arrayMove,
SortableContext,
rectSortingStrategy,
useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

function SortableEvent({
event,
deleteEvent,
router,
}: any) {
const {
attributes,
listeners,
setNodeRef,
transform,
transition,
} = useSortable({
id: event.id,
});

const style = {
transform:
CSS.Transform.toString(transform),
transition,
};

return (
<div
ref={setNodeRef}
style={style}
className="relative touch-none"
>
<div
{...attributes}
{...listeners}
onClick={() =>
router.push(
`/${event.name}`
)
}
className="flex aspect-square w-full items-end overflow-hidden rounded-3xl bg-white p-2 shadow transition-all duration-300 active:scale-95"
>
<div>
<h2 className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-black">
{event.name}
</h2>

<div className="text-xs text-gray-500">
達成率 {event.progress ?? 0}%
</div>
</div>
</div>

<button
onClick={() =>
deleteEvent(event.id)
}
className="absolute right-1 top-1 text-xs text-red-500"
>
✕
</button>
</div>
);
}

export default function Home() {
const [events, setEvents] = useState<
{
id: string;
name: string;
order: number;
progress?: number;
}[]
>([]);

const [user, setUser] =
useState<any | undefined>(undefined);

const [nickname, setNickname] = useState("");

const [needsNickname, setNeedsNickname] = useState(false);

const router = useRouter();

useEffect(() => {
const unsubscribe =
onAuthStateChanged(
auth,
async (user) => {

setUser(user);

if (!user) {
return;
}

const userRef =
doc(db, "users", user.uid);

const userSnap =
await getDoc(userRef);

if (!userSnap.exists()) {
setNeedsNickname(true);
}
}
);

return unsubscribe;
}, []);


useEffect(() => {
    if (user === null) {
        router.push("/login");
    }
}, [user, router]);

const [newEvent, setNewEvent] =
useState("");



const sensors = useSensors(
useSensor(PointerSensor, {
activationConstraint: {
delay: 150,
tolerance: 5,
},
})
);

// Firestore同期
useEffect(() => {
const unsubscribe = onSnapshot(
collection(db, "events"),
async (snapshot) => {

const eventsData = await Promise.all(
snapshot.docs.map(
async (docSnap) => {

const event = {
id: docSnap.id,
...(docSnap.data() as {
name: string;
order: number;
}),
};

console.log("event.name =", event.name);

const encodedEvent =
encodeURIComponent(event.name);

const categoriesSnapshot =
await getDocs(
collection(
db,
`${encodedEvent}_categories`
)
);

let totalTasks = 0;
let completedTasks = 0;

for (const categoryDoc of categoriesSnapshot.docs) {

const category =
categoryDoc.data();

const tasksSnapshot =
await getDocs(
collection(
db,
`${encodedEvent}_${category.name}`
)
);

const tasks =
tasksSnapshot.docs.map(
(doc) => doc.data()
);

totalTasks += tasks.length;

completedTasks +=
tasks.filter(
(task: any) =>
task.done
).length;
}

const progress =
totalTasks === 0
? 0
: Math.round(
(completedTasks /
totalTasks) *
100
);

return {
...event,
progress,
};
}
)
);

eventsData.sort(
(a, b) =>
a.order - b.order
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
order: events.length,
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

const saveNickname = async () => {
if (!user || !nickname.trim())
return;

await setDoc(
doc(db, "users", user.uid),
{
nickname,
email: user.email,
}
);

setNeedsNickname(false);
};

const handleDragEnd = async (
eventData: any
) => {
const { active, over } =
eventData;

if (
!over ||
active.id === over.id
)
return;

const oldIndex =
events.findIndex(
(event) =>
event.id === active.id
);

const newIndex =
events.findIndex(
(event) =>
event.id === over.id
);

const newEvents = arrayMove(
events,
oldIndex,
newIndex
);

setEvents(newEvents);

await Promise.all(
newEvents.map(
(event, index) =>
updateDoc(
doc(
db,
"events",
event.id
),
{
order: index,
}
)
)
);
};

if (user === undefined) {
return (
<div className="p-4">
読み込み中...
</div>
);
}

if (needsNickname) {
return (
<main className="flex h-screen flex-col items-center justify-center gap-4">

<h1 className="text-2xl font-bold">
ニックネーム登録
</h1>

<input
value={nickname}
onChange={(e) =>
setNickname(e.target.value)
}
placeholder="ニックネーム"
className="rounded-xl border p-3 text-black"
/>

<button
onClick={saveNickname}
className="rounded-xl bg-black px-4 py-2 text-white"
>
登録
</button>
</main>
);
}

return (
<main className="flex h-screen flex-col overflow-hidden bg-gray-50 p-4">

<div className="text-red-500">
    {user ? "ログイン済み" : "未ログイン"}
</div>

<h1 className="mb-6 text-3xl font-bold text-black">
FPWE tasks
</h1>

{user && (
<div className="mb-4 text-sm text-gray-600">
ログイン中: {user.displayName}
</div>
)}

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

<DndContext
 sensors={sensors}
 collisionDetection={
 closestCenter
 }
 onDragEnd={handleDragEnd}
>
 <SortableContext
 items={events.map(
 (event) => event.id
 )}
 strategy={
 rectSortingStrategy
 }
 >
 <div className="grid grid-cols-3 gap-2 overflow-y-auto pb-24">
 {events.map((event) => (
 <SortableEvent
 key={event.id}
 event={event}
 deleteEvent={
 deleteEvent
 }
 router={router}
 />
 ))}
 </div>
 </SortableContext>
</DndContext>
</main>
);
}