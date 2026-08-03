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
		OverflowMenuItem
	} from 'carbon-components-svelte';

	import { createLocalStorageStore } from '$lib/localStorage';

	let openTransactionDialog = false;

	type Item = {
		id: number;
		date: string;
		item: string;
		amount: number;
	};

	const itemsStore = createLocalStorageStore<Item[]>('app_items', []);

	function addItem(name: string, amount: number) {
		const newItem: Item = {
			id: Date.now(),
			date: new Date().toLocaleDateString(),
			item: name,
			amount: amount
		};

		$itemsStore = [...$itemsStore, newItem];
	}

	function removeItem(id: number) {
		$itemsStore = $itemsStore.filter((e) => e.id != id);
	}

	function makeNiceNumber(number: number) {
		if (number > 0) return `$${number}`;
		else return `-$${number.toString().slice(1)}`;
	}

	let newItemName: string = '';
	let newItemAmount: number = 0;

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		addItem(newItemName, newItemAmount);

		newItemName = '';
		newItemAmount = 0;
		openTransactionDialog = false;
	}
</script>

<div class="main-element">
	<h1>Budget tracker</h1>
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
					<OverflowMenuItem on:click={() => removeItem(row.id)} danger text="Remove" />
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
</div>

<Modal bind:open={openTransactionDialog} modalHeading="Add transaction" passiveModal>
	<Form on:submit={handleSubmit}>
		<TextInput bind:value={newItemName} fluid labelText="Item" />
		<NumberInput bind:value={newItemAmount} fluid hideSteppers labelText="Amount" />

		<!-- Custom button container for normal-sized side-by-side buttons -->
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
</style>
