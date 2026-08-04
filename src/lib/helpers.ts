import { subscriptionsStore } from './stores';
import { get } from 'svelte/store';

export function makeNiceNumber(number: number): string {
	if (number > 0) return `$${number}`;
	else return `-$${number.toString().slice(1)}`;
}

export function calculateSpendForMonth(checkingDate: Date) {
	let totalCost: number = 0;

	for (let subscription of get(subscriptionsStore)) {
		let subscriptionStart = new Date(subscription.startDate);
		subscriptionStart.setDate(1); // Set to the beginning of the month so that we are checking if it happened at all that month.
		subscriptionStart.setHours(0, 0, 0, 0); // We are pushing start to the beginning of this month, and pushing end to beginning of next month

		let subscriptionEnd = new Date(subscription.endDate);
		subscriptionEnd.setDate(1);
		subscriptionEnd.setHours(0, 0, 0, 0);
		subscriptionEnd.setMonth(subscriptionEnd.getMonth() - 1); // bring to beginning to math start

		if (
			subscriptionStart.getTime() <= checkingDate.getTime() &&
			subscriptionEnd.getTime() >= checkingDate.getTime()
		) {
			// Is checking if current date is after (higher number secs) start, and end is after current.
			totalCost += subscription.cost / subscription.period;
		}
	}

	return Number(totalCost.toFixed(2));
}
