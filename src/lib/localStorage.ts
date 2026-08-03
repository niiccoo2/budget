import { writable } from 'svelte/store';

export function createLocalStorageStore<T>(key: string, startValue: T) {
	// 1. Read existing value from LocalStorage if browser context exists
	const isBrowser = typeof window !== 'undefined';
	const savedValue = isBrowser ? localStorage.getItem(key) : null;

	const initial: T = savedValue ? JSON.parse(savedValue) : startValue;
	const store = writable<T>(initial);

	// 2. Subscribe to store updates and save automatically to LocalStorage
	if (isBrowser) {
		store.subscribe((value) => {
			localStorage.setItem(key, JSON.stringify(value));
		});
	}

	return store;
}
