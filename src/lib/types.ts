export type Item = {
	id: number;
	date: string;
	item: string;
	type: string;
	amount: number;
};

export type Subscription = {
	id: number;
	service: string;
	cost: number;
	period: number;
	startDate: string;
	endDate: string;
};
