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
		Tag
	} from 'carbon-components-svelte';
	import { makeNiceNumber } from '$lib/helpers';
	import type { Item } from '$lib/types';

	let newItemName: string = '';
	let newItemAmount: number = 0;
	let openTransactionDialog: boolean = false;
	let savingsCheck: boolean = false;

	function calculateAmountSendSavings() {
		let sendSavingsAmount: number = 0;

		for (let item of $itemsStore) {
			if (item.type == 'normal' && item.amount > 0) sendSavingsAmount += item.amount / 2;
			else if (item.type == 'savings' && item.amount < 0) sendSavingsAmount += item.amount;
		}

		return sendSavingsAmount;
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
</script>

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
		<NumberInput bind:value={newItemAmount} fluid hideSteppers labelText="Amount" />

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
</style>
