const { app } = require('@azure/functions');

app.http('httpTrigger1', {
	methods: ['GET', 'POST'],
	handler: async (req, context) => {
		context.log('JavaScript HTTP trigger function processed a request.');

		let name;
		if (req.query.has('name')) {
			name = req.query.get('name');
		} else {
			let body = await req.json();
			name = body.name;
		}

		const responseMessage = name
			? 'Hello, ' + name + '. This HTTP triggered function executed successfully.'
			: 'This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.';

		return { body: responseMessage };
	}
});
