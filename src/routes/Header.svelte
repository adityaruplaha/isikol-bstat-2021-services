<script lang="ts">
	import { signOut, signInWithRedirect } from "firebase/auth";
	import { Collection, FirebaseApp, User } from "sveltefire";
	import { auth, firestore, provider } from "$lib/firebase"
    import { collection, query, where } from "firebase/firestore";

	$: getUserRecord = (email: string | null) => {
		return query(collection(firestore, "users"), where('email', '==', email));
	}
</script>

<FirebaseApp {auth} {firestore}>
	<header>
		<User let:user>
			<Collection ref={getUserRecord(user.email)} let:data>
				{#each data as record}
					Hi, roll number: {record.rollno}.
				{/each}
			</Collection>
			Test
			<button on:click={() => signOut(auth)}>Sign Out</button>
		
			<div slot="signedOut">
				You are signed out.
				<button
					on:click={() => signInWithRedirect(auth, provider)}
				>Sign in with Google.</button>
			</div>
		</User>
	</header>
</FirebaseApp>