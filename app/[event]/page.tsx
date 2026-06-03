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
 className="flex aspect-square items-end overflow-hidden rounded-3xl bg-white p-2 shadow transition-all duration-300 active:scale-95"
 >
 <h2 className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-black">
 {category.name}
 </h2>
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
 const unsubscribe =
 onSnapshot(
 collection(
 db,
 `${event}_categories`
 ),
 (snapshot) => {
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

 setCategories(data);
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