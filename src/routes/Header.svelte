<script lang="ts">
	import { signOut, signInWithRedirect } from "firebase/auth";
	import { Doc, FirebaseApp, User } from "sveltefire";
	import { auth, firestore, provider } from "$lib/firebase"
</script>

<FirebaseApp {auth} {firestore}>
	<header>
		<User let:user>
			<Doc ref="/users/{user.uid}" let:data>
				Hi, {data.name}. Your roll number is {data.rollno}.
			</Doc>
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