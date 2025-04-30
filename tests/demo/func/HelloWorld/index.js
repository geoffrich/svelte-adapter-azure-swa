// eslint-disable-next-line @typescript-eslint/no-require-imports
const { app } = require('@azure/functions');

app.http('HelloWorld', {
	methods: ['GET', 'POST'],
	handler: async (req, context) => {
		context.log('JavaScript HTTP trigger function processed a request.');

		let name;
		if (req.query.has('name')) {
			name = req.query.get('name');
		} else if (req.headers.get('content-type') === 'application/json') {
			let body = await req.json();
			name = body.name;
		}

		const responseMessage = name
			? 'Hello, ' + name + '. This HTTP triggered function executed successfully.'
			: 'This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.';

		return { body: responseMessage };
	}
});
