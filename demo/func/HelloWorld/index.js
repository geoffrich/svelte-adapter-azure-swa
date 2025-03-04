const { app } = require('@azure/functions');

app.setup({ enableHttpStream: true });

// https://github.com/Azure/azure-functions-nodejs-library/issues/236
app.http('streamPoem', {
	methods: ['GET'],
	authLevel: 'anonymous',
	handler: async (request, context) => {
		context.log(`Http function processed request for url "${request.url}"`);

		const shortPoem = `
            Roses are red,
            Violets are blue,
            Sugar is sweet,
            And so are you.
        `;

		const poem = shortPoem.repeat(20);

		const delayedStream = stringToDelayedStream(poem, 100);

		return {
			body: delayedStream
		};
	}
});

function stringToDelayedStream(str, delay) {
	const lines = str.split('\n');
	let index = 0;

	return new ReadableStream({
		start(controller) {
			const interval = setInterval(() => {
				if (index < lines.length) {
					console.log('next chunk', index);
					const line = lines[index] + '\n';
					controller.enqueue(line);
					index++;
				} else {
					clearInterval(interval);
					controller.close(); // Mark the end of the stream
				}
			}, delay);
		}
	});
}
