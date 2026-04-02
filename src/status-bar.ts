export type SyncState = "synced" | "syncing" | "error";

const EMOJI: Record<SyncState, string> = {
	synced: "✅",
	syncing: "🔄",
	error: "⚠️",
};

const LABEL: Record<SyncState, string> = {
	synced: "Synced",
	syncing: "Syncing",
	error: "Out of sync",
};

export class SyncStatusBar {
	private el: HTMLElement;
	private state: SyncState = "synced";
	private count: number | null = null;

	constructor(statusBarEl: HTMLElement) {
		this.el = statusBarEl;
		this.render();
	}

	setSyncing(processed: number) {
		this.state = "syncing";
		this.count = processed;
		this.render();
	}

	setSynced() {
		this.state = "synced";
		this.count = null;
		this.render();
	}

	setError() {
		this.state = "error";
		this.count = null;
		this.render();
	}

	private render() {
		const emoji = EMOJI[this.state];
		const label = LABEL[this.state];
		const suffix = this.state === "syncing" && this.count !== null ? ` ${this.count}` : "";
		this.el.setText(`${emoji} ${label}${suffix}`);
	}
}
