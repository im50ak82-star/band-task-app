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

type Task = {
 id: string;
 title: string;
 done: boolean;
 order: number;
 dueDate?: string;
};

function SortableItem({
 task,
 toggleTask,
 deleteTask,
}: any) {
 const {
 attributes,
 listeners,
 setNodeRef,
 transform,
 transition,
 } = useSortable({
 id: task.id,
 });

 const style = {
 transform:
 CSS.Transform.toString(
 transform
 ),
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
 toggleTask(task)
 }
 className={`flex aspect-square w-full select-none items-end overflow-hidden rounded-3xl p-3 text-left text-sm shadow transition-all duration-300 active:scale-95 ${
 task.done
 ? "scale-95 bg-gray-200 text-gray-700"
 : "bg-white text-black"
 }`}
 >
 <div>
<div>
{task.title}
</div>

{task.dueDate && (
<div className="text-xs opacity-70">
📅 {task.dueDate}
</div>
)}
</div>
 </div>

 {/* 削除 */}
 <button
 onClick={(e) => {
 e.stopPropagation();
 deleteTask(task);
 }}
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

if (!event) return null;

 const [tasks, setTasks] =
 useState<Task[]>([]);

 const [newTask, setNewTask] =
 useState("");

 const [dueDate, setDueDate] =
 useState("");

 // 長押しでドラッグ
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
 const unsubscribe =
 onSnapshot(
 collection(db, event),
 (snapshot) => {
 const tasksData =
 snapshot.docs
 .map((doc) => ({
 id: doc.id,
 ...(doc.data() as Omit<
 Task,
 "id"
 >),
 }))
 .sort(
 (a, b) =>
 a.order - b.order
 );

 setTasks(tasksData);
 }
 );

 return () => unsubscribe();
 }, [event]);

 // タスク追加
 const addTask = async () => {
 if (
 newTask.trim() === ""
 )
 return;

 await addDoc(
 collection(db, event),
 {
 title: newTask,
 done: false,
 order: tasks.length,
 dueDate,
 }
 );

 setNewTask("");
 setDueDate("");
 };

 // 完了切り替え
 const toggleTask = async (
 task: Task
 ) => {
 await updateDoc(
 doc(db, event, task.id),
 {
 done: !task.done,
 }
 );
 };

 // 削除
 const deleteTask = async (
 task: Task
 ) => {
 await deleteDoc(
 doc(db, event, task.id)
 );
 };

 // ドラッグ終了
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
 tasks.findIndex(
 (task) =>
 task.id === active.id
 );

 const newIndex =
 tasks.findIndex(
 (task) =>
 task.id === over.id
 );

 const newTasks = arrayMove(
 tasks,
 oldIndex,
 newIndex
 );

 setTasks(newTasks);

 await Promise.all(
 newTasks.map(
 (task, index) =>
 updateDoc(
 doc(
 db,
 event,
 task.id
 ),
 {
 order: index,
 }
 )
 )
 );
 };

 // 達成率
 const completedCount =
 tasks.filter(
 (task) => task.done
 ).length;

 const progress =
 tasks.length === 0
 ? 0
 : Math.round(
 (completedCount /
 tasks.length) *
 100
 );

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

 <div className="mb-6">
 <div className="mb-2 text-gray-700">
 達成率 {progress}%
 </div>

 <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
 <div
 className="h-full rounded-full bg-black transition-all duration-500"
 style={{
 width: `${progress}%`,
 }}
 />
 </div>
 </div>

 <div className="mb-6 flex gap-2">
 <input
 value={newTask}
 onChange={(e) =>
 setNewTask(
 e.target.value
 )
 }
 onKeyDown={(e) => {
 if (
 e.key === "Enter"
 ) {
 addTask();
 }
 }}
 placeholder="タスクを入力"
 className="flex-1 rounded-2xl border bg-white p-4 text-black placeholder-gray-500 outline-none"
 />

 <input
type="date"
value={dueDate}
onChange={(e) =>
setDueDate(e.target.value)
}
className="rounded-2xl border bg-white p-4 text-black"
/>

 <button
 onClick={addTask}
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
 onDragEnd={
 handleDragEnd
 }
 >
 <SortableContext
 items={tasks.map(
 (task) => task.id
 )}
 strategy={
 rectSortingStrategy
 }
 >
 <div className="grid flex-1 grid-cols-3 gap-2 overflow-y-auto pb-24">
 {tasks.map((task) => (
 <SortableItem
 key={task.id}
 task={task}
 toggleTask={
 toggleTask
 }
 deleteTask={
 deleteTask
 }
 />
 ))}
 </div>
 </SortableContext>
 </DndContext>
 </main>
 );
}