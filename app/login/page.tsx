"use client";

import { auth } from "../../firebase";

import {
GoogleAuthProvider,
signInWithPopup,
} from "firebase/auth";

export default function LoginPage() {
const login = async () => {
const provider =
new GoogleAuthProvider();

const result =
await signInWithPopup(
auth,
provider
);

console.log(result.user);
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