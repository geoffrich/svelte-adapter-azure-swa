export const load = () => {
	return {
		immediate: [1, 2, 3],
		streamed: new Promise((res, rej) => setTimeout(res, 3000)).then(() => [2, 4, 6])
	};
};
