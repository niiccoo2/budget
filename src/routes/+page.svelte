<script lang="ts">
	import {
		DataTable,
		Toolbar,
		ToolbarContent,
		Button,
		Modal,
		NumberInput,
		TextInput,
		Form,
		OverflowMenu,
		OverflowMenuItem,
		Checkbox,
		Tag,
		Tabs,
		Tab
	} from 'carbon-components-svelte';
	import type { Writable } from 'svelte/store';
	import { createLocalStorageStore } from '$lib/localStorage';

	let openTransactionDialog: boolean = false;
	let newItemName: string = '';
	let newItemAmount: number = 0;
	let savingsCheck: boolean = false;
	let tabIndex: number = 0;

	type Item = {
		id: number;
		date: string;
		item: string;
		type: string;
		amount: number;
	};

	type Subscription = {
		id: number;
		service: string;
		cost: number;
		period: number;
		startDate: Date;
		endDate: Date;
	};

	const itemsStore = createLocalStorageStore<Item[]>('items', []);
	const subscriptionsStore = createLocalStorageStore<Subscription[]>('subscriptions', []);

	function addItem(name: string, type: string, amount: number) {
		const newItem: Item = {
			id: Date.now(),
			date: new Date().toLocaleDateString(),
			item: name,
			type: type,
			amount: amount
		};

		$itemsStore = [...$itemsStore, newItem];
	}

	function removeItem<T extends { id: number }>(store: Writable<T[]>, id: number) {
		store.update((items) => items.filter((item) => item.id !== id));
	}

	function makeNiceNumber(number: number) {
		if (number > 0) return `$${number}`;
		else return `-$${number.toString().slice(1)}`;
	}

	function calculateAmountSendSavings() {
		let sendSavingsAmount: number = 0;

		for (let item of $itemsStore) {
			if (item.type == 'normal' && item.amount > 0) sendSavingsAmount += item.amount / 2;
			else if (item.type == 'savings' && item.amount < 0) sendSavingsAmount += item.amount;
		}

		return sendSavingsAmount;
	}
</script>

<div class="main-element">
	<div class="header">
		<h1 class="first">Budget tracker</h1>

		<div>
			<Tabs bind:selected={tabIndex}>
				<Tab label="Transactions" />
				<Tab label="Subscriptions" />
			</Tabs>
		</div>
	</div>

	{#if tabIndex == 0}
		<div>
			{#if calculateAmountSendSavings() > 0}
				<Tag type="red">You must send ${calculateAmountSendSavings()} to savings.</Tag>
			{:else}
				<Tag type="red" style="visibility: hidden;"
					>You must send ${calculateAmountSendSavings()} to savings.</Tag
				>
			{/if}
		</div>
		<DataTable
			headers={[
				{ key: 'date', value: 'Date', width: '15%' },
				{ key: 'item', value: 'Item', width: '70%' },
				{ key: 'amount', value: 'Amount', width: '15%' },
				{ key: 'overflow', empty: true, width: '72px' }
			]}
			rows={$itemsStore}
		>
			<svelte:fragment slot="cell" let:cell let:row>
				{#if cell.key === 'overflow'}
					<OverflowMenu portalMenu flipped>
						<OverflowMenuItem
							on:click={() => removeItem(itemsStore, row.id)}
							danger
							text="Remove"
						/>
					</OverflowMenu>
				{:else if cell.key === 'amount'}
					<span class:positive={cell.value > 0}>
						{makeNiceNumber(cell.value)}
					</span>
				{:else}
					{cell.value}
				{/if}
			</svelte:fragment>
			<Toolbar>
				<ToolbarContent>
					<Button on:click={() => (openTransactionDialog = true)}>Add transaction</Button>
				</ToolbarContent>
			</Toolbar>
		</DataTable>

		<Modal bind:open={openTransactionDialog} modalHeading="Add transaction" passiveModal>
			<Form
				on:submit={(e) => {
					e.preventDefault();

					if (savingsCheck) {
						const newItem: Item = {
							id: Date.now(),
							date: new Date().toLocaleDateString(),
							item: 'Savings transfer',
							type: 'savings',
							amount: newItemAmount
						};
					} else {
						const newItem: Item = {
							id: Date.now(),
							date: new Date().toLocaleDateString(),
							item: newItemName,
							type: 'normal',
							amount: newItemAmount
						};
					}

					$itemsStore = [...$itemsStore, newItem];

					newItemName = '';
					newItemAmount = 0;
					savingsCheck = false;
					openTransactionDialog = false;
				}}
			>
				<Checkbox
					bind:checked={savingsCheck}
					style="margin: 0 0 2vh 0"
					labelText="Savings transfer"
				/>
				{#if !savingsCheck}
					<TextInput bind:value={newItemName} fluid labelText="Item" />
				{/if}
				<NumberInput bind:value={newItemAmount} fluid hideSteppers labelText="Amount" />

				<div class="button-row">
					<Button kind="secondary" size="field" on:click={() => (openTransactionDialog = false)}>
						Cancel
					</Button>
					<Button type="submit" size="field">Submit</Button>
				</div>
			</Form>
		</Modal>
	{:else}
		<div>
			<Tag type="red" style="visibility: hidden;">I need a tag here for spacing and I'm lazy.</Tag>
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
					<Button on:click={() => (openTransactionDialog = true)}>Add subscription</Button>
				</ToolbarContent>
			</Toolbar>
		</DataTable>
	{/if}
</div>

<style>
	.positive {
		color: #4589ff;
		font-weight: bold;
	}

	.main-element {
		display: flex;
		flex-direction: column;
		margin: 5vh 20vw;
		gap: 2rem;
	}

	.button-row {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.header {
		display: flex;
		align-items: center;
	}

	.first {
		flex: 1;
	}
</style>
