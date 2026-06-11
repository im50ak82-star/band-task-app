export async function GET() {
const webhookUrl =
process.env.DISCORD_WEBHOOK_URL;

if (!webhookUrl) {
return Response.json(
{ error: "Webhook URL not found" },
{ status: 500 }
);
}

await fetch(webhookUrl, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
content:
"🧪 FPWE Tasks テスト通知",
}),
});

return Response.json({
success: true,
});
}