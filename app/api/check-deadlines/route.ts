import { db } from "../../../firebase";

import {
collection,
getDocs,
} from "firebase/firestore";

export async function GET() {
const webhookUrl =
process.env.DISCORD_WEBHOOK_URL;

if (!webhookUrl) {
return Response.json(
{ error: "Webhook URL not found" },
{ status: 500 }
);
}

const tomorrow = new Date();
tomorrow.setDate(
tomorrow.getDate() + 1
);

const tomorrowString =
tomorrow.toISOString().split("T")[0];

const eventsSnapshot =
await getDocs(
collection(db, "events")
);

const lines: string[] = [];

for (const eventDoc of eventsSnapshot.docs) {
const event =
eventDoc.data();

const encodedEvent =
  encodeURIComponent(
    event.name
  );

const categoriesSnapshot =
  await getDocs(
    collection(
      db,
      `${encodedEvent}_categories`
    )
  );

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
    tasksSnapshot.docs
      .map((doc) => doc.data())
      .filter(
        (task: any) =>
          !task.done &&
          task.dueDate ===
            tomorrowString
      );

  if (tasks.length > 0) {
    lines.push(
      `【${event.name} / ${category.name}】`
    );

    tasks.forEach(
      (task: any) => {
        lines.push(
          `・${task.title}`
        );
      }
    );

    lines.push("");
  }
}
}

if (lines.length === 0) {
return Response.json({
message:
"No deadlines tomorrow",
});
}

await fetch(webhookUrl, {
method: "POST",
headers: {
"Content-Type":
"application/json",
},
body: JSON.stringify({
content:
"📢 FPWE Tasks 締切通知\n\n明日締切のタスク\n\n" +
lines.join("\n"),
}),
});

return Response.json({
success: true,
});
}