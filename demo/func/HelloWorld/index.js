const { app } = require('@azure/functions');
const { Readable } = require('stream');

app.http('HelloWorld', {
	methods: ['GET', 'POST'],
	handler: async (req, context) => {
		context.log('JavaScript HTTP trigger function processed a request.');
		return { body: createNumberStream() };
	}
});

function createNumberStream() {
	let current = 1;

	return new Readable({
		objectMode: true, // Ensures numbers are treated as objects, not buffers
		read() {
			if (current <= 10) {
				setTimeout(() => {
					this.push(String(current++)); // Push the number as a string
				}, 1000);
			} else {
				this.push(null); // End the stream
			}
		}
	});
}
