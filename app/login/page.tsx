"use client";

import { auth } from "../../firebase";

import {
GoogleAuthProvider,
signInWithRedirect,
} from "firebase/auth";

export default function LoginPage() {
const login = async () => {
try {
alert("押された");

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