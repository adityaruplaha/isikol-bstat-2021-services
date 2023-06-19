<script lang="ts">
	import "../app.css";

	import { onMount } from "svelte";
	import {
		initializeAppCheck,
		ReCaptchaEnterpriseProvider,
	} from "firebase/app-check";
	import { FirebaseApp } from "sveltefire";

	import { app, auth, firestore } from "$lib/firebase";
	import Header from "./Header.svelte";

	onMount(() => {
		initializeAppCheck(app, {
			provider: new ReCaptchaEnterpriseProvider(
				"6LcKJEQmAAAAABtUr8IiRDHSIUACHY0napjqh9ed"
			),
			isTokenAutoRefreshEnabled: true,
		});
	});
</script>

<FirebaseApp {auth} {firestore}>
	<div class="flex flex-col min-h-screen">
		<Header />

		<main class="m-0 flex flex-col flex-1 bg-slate-700 text-gray-100 min-h-full">
			<slot />
		</main>
	</div>
</FirebaseApp>