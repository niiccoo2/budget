import { createLocalStorageStore } from '$lib/localStorage';
import type { Item, Subscription } from '$lib/types';
import type { Writable } from 'svelte/store';

export const itemsStore = createLocalStorageStore<Item[]>('items', []);
export const subscriptionsStore = createLocalStorageStore<Subscription[]>('subscriptions', []);

export function removeItem<T extends { id: number }>(store: Writable<T[]>, id: number) {
	store.update((items) => items.filter((item) => item.id !== id));
}
