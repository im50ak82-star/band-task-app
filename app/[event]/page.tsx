"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

import { db } from "../../firebase";

import {
 collection,
 addDoc,
 onSnapshot,
 deleteDoc,
 doc,
 updateDoc,
 getDocs,
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

import { useRouter } from "next/navigation";

type Category = {
 id: string;
 name: string;
 order: number;
 progress?: number;
};

function SortableCategory({
 category,
 deleteCategory,
 event,
    router,
}: any) {
 const {
 attributes,
 listeners,
 setNodeRef,
 transform,
 transition,
 } = useSortable({
 id: category.id,
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
 `/${event}/${category.name}`
 )
 }
 className="relative flex aspect-square items-end overflow-hidden rounded-3xl bg-white p-2 shadow transition-all duration-300 active:scale-95"
 >
<div
className="absolute bottom-0 left-0 w-full overflow-hidden"
style={{
height: `${category.progress ?? 0}%`,
transition: "height 2s cubic-bezier(0.22, 1, 0.36, 1)",
background:"rgba(0,0,255,0.3)"
}}
>
<div
className="absolute inset-0"
style={{
background:
(category.progress ?? 0) === 100
? "linear-gradient(to top, rgba(14,165,233,0.85), rgba(56,189,248,0.75))"
: "linear-gradient(to top, rgba(56,189,248,0.65), rgba(56,189,248,0.55))",
}}
/>
{(category.progress ?? 0) < 100 && (
<>
<svg
className="absolute -top-4 left-0 w-[200%]"
viewBox="0 0 1200 120"
preserveAspectRatio="none"
style={{
height: "20px",
animation: "waveMove 3s linear infinite",
}}
>
<path
d="M0,60 C100,-20 250,140 450,60 C650,-20 850,140 1200,60 L1200,120 L0,120 Z"
fill="rgba(255,255,255,0.45)"
/>
</svg>

<svg
className="absolute -top-3 left-0 w-[200%]"
viewBox="0 0 1200 120"
preserveAspectRatio="none"
style={{
height: "14px",
animation: "waveMoveReverse 2s linear infinite",
}}
>
<path
d="M0,60 C150,140 300,-20 600,60 C900,140 1050,-20 1200,60 L1200,120 L0,120 Z"
fill="rgba(255,255,255,0.25)"
/>
</svg>
</>
)}

<div
className="absolute left-[20%] bottom-2 h-2 w-2 rounded-full bg-white/60"
style={{
animation: "bubble 4s linear infinite",
}}
/>

<div
className="absolute left-[55%] bottom-4 h-3 w-3 rounded-full bg-white/50"
style={{
animation: "bubble 5s linear infinite",
animationDelay: "1s",
}}
/>

<div
className="absolute left-[75%] bottom-1 h-2 w-2 rounded-full bg-white/40"
style={{
animation: "bubble 3.5s linear infinite",
animationDelay: "2s",
}}
/>
</div>

<div className="relative z-10">
<h2 className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-black">
{category.name}
</h2>

<div className="mt-1 text-xs text-gray-700">
{category.progress ?? 0}%
</div>
</div>
 </div>

 <button
 onClick={() =>
 deleteCategory(category.id)
 }
 className="absolute right-1 top-1 text-xs text-red-500"
 >
 ✕
 </button>
 </div>
 );
}

export default function EventPage({
 params,
}: {
 params: Promise<{ event: string }>;
}) {
 const { event } = use(params);

 const [categories, setCategories] =
 useState<Category[]>([]);

 const [newCategory, setNewCategory] =
 useState("");

 const sensors = useSensors(
 useSensor(PointerSensor, {
 activationConstraint: {
 delay: 150,
 tolerance: 5,
 },
 })
 );

 const router = useRouter();

useEffect(() => {
const unsubscribe = onSnapshot(
collection(db, `${event}_categories`),
async (snapshot) => {
const data = snapshot.docs
.map((doc) => ({
id: doc.id,
...(doc.data() as {
name: string;
order: number;
}),
}))
.sort(
(a, b) =>
(a.order ?? 0) -
(b.order ?? 0)
);

const categoriesWithProgress =
await Promise.all(
data.map(async (category) => {

const taskSnapshot =
await getDocs(
collection(
db,
`${event}_${category.name}`
)
);


const tasks =
taskSnapshot.docs.map(
(doc) => doc.data()
);

const total =
tasks.length;

const completed =
tasks.filter(
(task: any) =>
task.done
).length;


const progress =
total === 0
? 0
: Math.round(
(completed /
total) *
100
);

return {
...category,
progress,
};
})
);

setCategories(
categoriesWithProgress
);
}
);

return () => unsubscribe();
}, [event]);

 const addCategory =
 async () => {
 if (
 newCategory.trim() === ""
 )
 return;

 await addDoc(
 collection(
 db,
 `${event}_categories`
 ),
 {
 name: newCategory,
 order: categories.length,
 }
 );

 setNewCategory("");
 };

 const deleteCategory =
 async (id: string) => {
 await deleteDoc(
 doc(
 db,
 `${event}_categories`,
 id
 )
 );
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
 categories.findIndex(
 (category) =>
 category.id === active.id
 );

 const newIndex =
 categories.findIndex(
 (category) =>
 category.id === over.id
 );

 const newCategories =
 arrayMove(
 categories,
 oldIndex,
 newIndex
 );

 setCategories(newCategories);

 await Promise.all(
 newCategories.map(
 (category, index) =>
 updateDoc(
 doc(
 db,
 `${event}_categories`,
 category.id
 ),
 {
 order: index,
 }
 )
 )
 );
 };

 return (
 <main className="flex h-screen flex-col overflow-hidden bg-gray-50 p-4">
 <Link
 href="/"
 className="mb-4 inline-block text-gray-500"
 >
 ← イベント一覧
 </Link>

 <h1 className="mb-6 text-3xl font-bold text-black">
 {decodeURIComponent(event)}
 </h1>

 <div className="mb-6 flex gap-2">

 <input
value={newCategory}
onChange={(e) =>
setNewCategory(
e.target.value
)
}
onKeyDown={(e) => {
if (e.key === "Enter") {
addCategory();
}
}}
placeholder="カテゴリ名"
className="flex-1 rounded-2xl border bg-white p-4 text-black outline-none"
/>

 <button
 onClick={addCategory}
 className="rounded-2xl bg-black px-5 text-white active:scale-95"
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
 items={categories.map(
 (category) =>
 category.id
 )}
 strategy={
 rectSortingStrategy
 }
 >
 <div className="grid grid-cols-3 gap-2 overflow-y-auto content-start">
 {categories.map(
 (category) => (
 <SortableCategory
 key={category.id}
 category={category}
 deleteCategory={
 deleteCategory
 }
 event={event}
    router={router}
 />
 )
 )}
 </div>
 </SortableContext>
 </DndContext>
 </main>
 );
}