"use client";

import { auth } from "../../firebase";

import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

import {
GoogleAuthProvider,
signInWithRedirect,
} from "firebase/auth";

import { useRouter } from "next/navigation";

export default function LoginPage() {
const router = useRouter();

useEffect(() => {
return onAuthStateChanged(auth, (user) => {
console.log("login page user:", user);

if (user) {
router.push("/");
}
});
}, [router]);

const login = async () => {
try {

const provider =
new GoogleAuthProvider();

await signInWithRedirect(
auth,
provider
);

alert("redirect実行");
} 
catch (error: any) {
console.error(error);

alert(
error.code +
"\n" +
error.message
);
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