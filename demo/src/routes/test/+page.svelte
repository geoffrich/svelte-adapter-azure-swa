<script>
	async function getRandomNumber() {
		const res = await fetch(`/api/random`);
		const json = await res.json();

		if (res.ok) {
			return json;
		} else {
			throw new Error(JSON.stringify(json));
		}
	}

	let promise = getRandomNumber();

	function handleClick() {
		promise = getRandomNumber();
	}
</script>

<button on:click={handleClick}> generate random number </button>

{#await promise}
	<p>...waiting</p>
{:then number}
	<p>The number is {number}</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
