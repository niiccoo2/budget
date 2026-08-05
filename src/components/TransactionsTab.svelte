<script lang="ts">
	import { itemsStore, removeItem } from '$lib/stores';
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
		Text
	} from 'carbon-components-svelte';
	import { makeNiceNumber } from '$lib/helpers';
	import type { Item } from '$lib/types';
	import { calculateSpendForMonth } from '$lib/helpers';

	let newItemName: string = '';
	let newItemAmount: number = 0;
	let openTransactionDialog: boolean = false;
	let savingsCheck: boolean = false;

	function findMonths(items: Item[]): Date[] {
		const uniqueTimeStamps = new Set<number>();

		for (let item of items) {
			let date = new Date(item.date);
			date.setDate(1);
			date.setHours(1, 0, 0, 0); // set to 01:00 as to not catch subs from month before

			// .getTime() returns a primitive number, which Set/includes CAN compare correctly!
			uniqueTimeStamps.add(date.getTime());
		}

		// Convert the unique timestamps back into Date objects
		return Array.from(uniqueTimeStamps).map((time) => new Date(time));
	}

	function calculateAmountSendSavings() {
		let sendSavingsAmount: number = 0;

		for (let item of $itemsStore) {
			if (item.type == 'normal' && item.amount > 0) sendSavingsAmount += item.amount / 2;
			else if (item.type == 'savings' && item.amount < 0) sendSavingsAmount += item.amount;
		}

		let activeMonths: Date[] = findMonths($itemsStore);

		for (let month of activeMonths) {
			// for each month that has things happening
			sendSavingsAmount += calculateSpendForMonth(month);
		}

		return Math.round(sendSavingsAmount * 100) / 100;
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		let newItem: Item;

		if (savingsCheck) {
			newItem = {
				id: Date.now(),
				date: new Date().toLocaleDateString(),
				item: 'Savings transfer',
				type: 'savings',
				amount: newItemAmount
			};
		} else {
			newItem = {
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
	}

	function calcTotalBalance() {
		let totalBalance: number = 0;

		for (let item of $itemsStore) {
			totalBalance += item.amount;
		}

		return Math.round(totalBalance * 100) / 100;
	}
</script>

<div class="top-row">
	<div>
		{#if calculateAmountSendSavings() > 0}
			<Tag type="red">You must send ${calculateAmountSendSavings()} to savings.</Tag>
		{:else}
			<Tag type="red" style="visibility: hidden;"
				>You must send ${calculateAmountSendSavings()} to savings.</Tag
			>
		{/if}
	</div>
	<div class="right-item">
		<Text>Current balance: <span class="positive">{makeNiceNumber(calcTotalBalance())}</span></Text>
	</div>
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
				<OverflowMenuItem on:click={() => removeItem(itemsStore, row.id)} danger text="Remove" />
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
	<Form on:submit={handleSubmit}>
		<Checkbox bind:checked={savingsCheck} style="margin: 0 0 2vh 0" labelText="Savings transfer" />
		{#if !savingsCheck}
			<TextInput bind:value={newItemName} fluid labelText="Item" />
		{/if}
		<NumberInput bind:value={newItemAmount} step={0.01} fluid hideSteppers labelText="Amount" />

		<div class="button-row">
			<Button kind="secondary" size="field" on:click={() => (openTransactionDialog = false)}>
				Cancel
			</Button>
			<Button type="submit" size="field">Submit</Button>
		</div>
	</Form>
</Modal>

<style>
	.positive {
		color: #4589ff;
		font-weight: bold;
	}

	.button-row {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.top-row {
		display: flex;
		align-items: center; /* vertical alignment */
		gap: 1rem;
	}

	.right-item {
		margin-left: auto;
	}
</style>
