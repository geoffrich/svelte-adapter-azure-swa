const url = 'http://httpbin.org/post';

export const actions = {
	multipartformdata: async (event) => {
		const formdata = await event.request.formData();
		const body = new FormData();
		body.append('file', formdata.get('file'));
		const requestOptions = {
			method: 'POST',
			body: body
		};
		console.log(...formdata);
		console.log('code only available in backend');
		try {
			const fetchURL = url;
			const res = await fetch(fetchURL, requestOptions);
			console.log('response ==>>>', res);
			const response = await res.json();
			return { response };
		} catch (e) {
			return { success: false };
		}
	}
};
