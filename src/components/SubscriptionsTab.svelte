<script lang="ts">
	import {
		DataTable,
		Toolbar,
		ToolbarContent,
		Button,
		OverflowMenu,
		OverflowMenuItem,
		Tag,
		Modal,
		Form,
		TextInput,
		NumberInput,
		DatePicker,
		DatePickerInput,
		Text
	} from 'carbon-components-svelte';
	import { subscriptionsStore, removeItem } from '$lib/stores';
	import { makeNiceNumber } from '$lib/helpers';
	import type { Subscription } from '$lib/types';

	let openSubscriptionDialog: boolean = false;
	let newSubscriptionCost: number = 0;
	let newSubscriptionService: string = '';
	let newSubscriptionPeriod: number = 0;
	let newSubscriptionStartDate: string = '';
	let newSubscriptionEndDate: string = '';

	function onNewSubscriptionSubmit(event: SubmitEvent) {
		event.preventDefault();

		const newSubscription: Subscription = {
			id: Date.now(),
			service: newSubscriptionService,
			cost: newSubscriptionCost,
			period: newSubscriptionPeriod,
			startDate: new Date(newSubscriptionStartDate).toLocaleDateString(),
			endDate: new Date(newSubscriptionEndDate).toLocaleDateString()
		};

		$subscriptionsStore = [...$subscriptionsStore, newSubscription];

		openSubscriptionDialog = false;
		newSubscriptionCost = 0;
		newSubscriptionService = '';
		newSubscriptionPeriod = 0;
		newSubscriptionStartDate = '';
		newSubscriptionEndDate = '';
	}

	function calcSpendForMonth(checkingDate: Date) {
		let totalCost: number = 0;

		for (let subscription of $subscriptionsStore) {
			let subscriptionStart = new Date(subscription.startDate);
			subscriptionStart.setDate(0); // Set to the beginning of teh month so that we are checking if it happened at all that month.
			subscriptionStart.setTime(0); // We are pushing start to the beginning of this month, and pushing end to beginning of next month

			let subscriptionEnd = new Date(subscription.endDate);
			subscriptionEnd.setDate(0);
			subscriptionEnd.setTime(0);
			if (subscriptionEnd.getMonth() < 11) {
				// If month is not 11, iterate, otherwise, set to 0 and iterate year
				subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
			} else {
				subscriptionEnd.setMonth(0);
				subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
			}

			if (
				subscriptionStart.getTime() > checkingDate.getTime() &&
				subscriptionEnd.getTime() > checkingDate.getTime()
			) {
				// Is checking if current date is after (higher number secs) start, and end is after current.
				totalCost += subscription.cost;
			}
		}

		return totalCost;
	}
</script>

<div>
	<Text>You are spending {calcSpendForMonth(new Date())}</Text>
</div>
<DataTable
	headers={[
		{ key: 'service', value: 'Service', width: '70%' },
		{ key: 'cost', value: 'Cost', width: '15%' },
		{ key: 'period', value: 'Period', width: '15%' },
		{ key: 'startDate', value: 'Start', width: '15%' },
		{ key: 'endDate', value: 'End', width: '15%' },
		{ key: 'overflow', empty: true, width: '72px' }
	]}
	rows={$subscriptionsStore}
>
	<svelte:fragment slot="cell" let:cell let:row>
		{#if cell.key === 'overflow'}
			<OverflowMenu portalMenu flipped>
				<OverflowMenuItem
					on:click={() => removeItem(subscriptionsStore, row.id)}
					danger
					text="Remove"
				/>
			</OverflowMenu>
		{:else if cell.key === 'cost'}
			{makeNiceNumber(cell.value)}
		{:else if cell.key === 'period'}
			{#if cell.value > 1}
				{cell.value} months
			{:else}
				{cell.value} month
			{/if}
		{:else}
			{cell.value}
		{/if}
	</svelte:fragment>
	<Toolbar>
		<ToolbarContent>
			<Button on:click={() => (openSubscriptionDialog = true)}>Add subscription</Button>
		</ToolbarContent>
	</Toolbar>
</DataTable>

<Modal bind:open={openSubscriptionDialog} modalHeading="Add transaction" passiveModal>
	<Form on:submit={onNewSubscriptionSubmit}>
		<TextInput bind:value={newSubscriptionService} fluid labelText="Service" />
		<NumberInput bind:value={newSubscriptionCost} step={0.01} fluid hideSteppers labelText="Cost" />
		<NumberInput
			bind:value={newSubscriptionPeriod}
			fluid
			hideSteppers
			labelText="Period (months)"
		/>

		<DatePicker
			datePickerType="range"
			bind:valueFrom={newSubscriptionStartDate}
			bind:valueTo={newSubscriptionEndDate}
			on:change
		>
			<DatePickerInput labelText="Start date" placeholder="mm/dd/yyyy" />
			<DatePickerInput labelText="End date" placeholder="mm/dd/yyyy" />
		</DatePicker>

		<div class="button-row">
			<Button kind="secondary" size="field" on:click={() => (openSubscriptionDialog = false)}>
				Cancel
			</Button>
			<Button type="submit" size="field">Submit</Button>
		</div>
	</Form>
</Modal>

<style>
	.button-row {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1.5rem;
	}
</style>
