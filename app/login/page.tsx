"use client";

import { auth } from "../../firebase";

import { useEffect } from "react";

import {
GoogleAuthProvider,
signInWithPopup,
onAuthStateChanged,
} from "firebase/auth";

import { useRouter } from "next/navigation";

export default function LoginPage() {
const router = useRouter();

useEffect(() => {
    console.log("currentUser", auth.currentUser);
}, []);

useEffect(() => {
const unsubscribe =
onAuthStateChanged(
auth,
(user) => {
console.log(
"auth state",
user
);

if (user) {
router.push("/");
}
}
);

return unsubscribe;
}, [router]);

const login = async () => {

const provider =
new GoogleAuthProvider();

try {
await signInWithPopup(
auth,
provider
);

alert("ログイン成功");
router.push("/");
} catch (error) {
console.error(error);
}
};

return (
<main className="flex h-screen items-center justify-center">
<button
onClick={login}
className="rounded-2xl bg-black px-6 py-3 text-white"
>
Googleでログイン
</button>
</main>
);
}