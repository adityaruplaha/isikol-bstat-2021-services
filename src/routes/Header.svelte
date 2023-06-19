<script lang="ts">
	import { signOut, signInWithRedirect } from "firebase/auth";
	import { Doc, User } from "sveltefire";
	import { auth, provider } from "$lib/firebase";
</script>

<User let:user>
	<header class="flex flex-row bg-gray-900 text-white w-full">
		<Doc ref="/users/{user.uid}" let:data>
			<span
				class="flex-grow-0 text-xl p-4 bg-gray-800 inline align-middle uppercase"
			>
				{data.rollno}
			</span>
			<span class="flex-grow text-xl p-4 inline align-middle uppercase">
				{data.name}
			</span>
		</Doc>
		<button
			on:click={() => signOut(auth)}
			class="text-white w-fit flex-grow-0 bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 px-5 py-2.5 text-center inline-flex items-center justify-between"
		>
			Sign Out
		</button>
	</header>

	<svelte:fragment slot="signedOut">
		<header class="flex flex-row bg-gray-900 text-white w-full">
			<span class="flex-grow text-lg inline align-middle p-4">
				Sign in using your registered email to view.
			</span>
			<button
				on:click={() => signInWithRedirect(auth, provider)}
				class="text-white w-fit flex-grow-0 bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 px-5 py-2.5 text-center inline-flex items-center justify-between"
			>
				<svg
					class="mr-2 -ml-1 w-4 h-4"
					aria-hidden="true"
					focusable="false"
					data-prefix="fab"
					data-icon="google"
					role="img"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 488 512"
				>
					<path
						fill="currentColor"
						d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
					/>
				</svg>
				Sign in with Google
			</button>
		</header>
	</svelte:fragment>
</User>
