<script>
	const { data } = $props();
</script>

<h1>Test promise streaming</h1>

<p>{JSON.stringify(data.immediate)}</p>

{#await data.streamed}
	<p>Loading...</p>
{:then result}
	<p>{JSON.stringify(result)}</p>
{/await}
