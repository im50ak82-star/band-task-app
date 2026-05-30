import "./globals.css";

export const metadata = {
title: "FPWE tasks",
description: "FPWE tasks",
manifest: "/manifest.json",
};

export default function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
<html lang="ja">
<body>{children}</body>
</html>
);
}
