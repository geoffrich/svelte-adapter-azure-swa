<script>
	import { enhance } from '$app/forms';
	export let data;
	let loading;
</script>

<h1>Testing of SvelteKit with Azure SWA</h1>

<div class="mx-auto max-w-[1920px]">
	<form
		method="post"
		enctype="multipart/form-data"
		on:submit={() => {
			loading = true;
		}}
		use:enhance={(formData) => {
			// `form` is the `<form>` element
			// `data` is its `FormData` object
			// `action` is the URL to which the form is posted
			// `cancel()` will prevent the submission

			return async ({ result, update }) => {
				loading = false;

				// `result` is an `ActionResult` object
				// `update` is a function which triggers the logic that would be triggered if this callback wasn't set
				const testContainer = document.getElementById('testCool');
				testContainer.innerHTML = JSON.stringify(result.data?.response);
				console.log(result);
			};
		}}
	>
		<input type="file" name="file" id="file" accept="image/*" />
		<button type="submit" formaction="?/multipartformdata">Post Multipart FormData with File</button
		>
	</form>
	{#if loading}
		Loading ...
	{/if}
	<div id="testCool" />
</div>
