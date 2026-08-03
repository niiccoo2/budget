<script lang="ts">
	import { Tabs, Tab } from 'carbon-components-svelte';
	import SubscriptionsTab from '../components/SubscriptionsTab.svelte';
	import TransactionsTab from '../components/TransactionsTab.svelte';

	let tabIndex: number = 0;
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
		<TransactionsTab></TransactionsTab>
	{:else}
		<SubscriptionsTab></SubscriptionsTab>
	{/if}
</div>

<style>
	.main-element {
		display: flex;
		flex-direction: column;
		margin: 5vh 20vw;
		gap: 2rem;
	}

	.header {
		display: flex;
		align-items: center;
	}

	.first {
		flex: 1;
	}
</style>
