import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, OxydeVaultSyncSettings, OxydeVaultSyncSettingTab } from "./settings";
import { performSync } from "./sync";
import { SyncStatusBar } from "./status-bar";

export default class OxydeVaultSyncPlugin extends Plugin {
	settings: OxydeVaultSyncSettings;
	private syncIntervalId: number | null = null;
	private statusBar: SyncStatusBar;

	async onload() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<OxydeVaultSyncSettings>
		);

		this.statusBar = new SyncStatusBar(this.addStatusBarItem());

		this.addSettingTab(new OxydeVaultSyncSettingTab(this.app, this));

		this.addCommand({
			id: "sync-now",
			name: "Sync now",
			callback: () => this.sync(),
		});

		this.restartAutoSync();
	}

	onunload() {
		this.stopAutoSync();
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	restartAutoSync() {
		this.stopAutoSync();
		const intervalMs = this.settings.syncIntervalMinutes * 60 * 1000;
		if (intervalMs > 0) {
			this.syncIntervalId = this.registerInterval(
				window.setInterval(() => this.sync(), intervalMs)
			);
		}
	}

	private stopAutoSync() {
		if (this.syncIntervalId !== null) {
			window.clearInterval(this.syncIntervalId);
			this.syncIntervalId = null;
		}
	}

	async sync() {
		await performSync(this.settings.vaultUrl, this.app.vault, {
			onStart: () => this.statusBar.setSyncing(0),
			onProgress: (n) => this.statusBar.setSyncing(n),
			onDone: () => this.statusBar.setSynced(),
			onError: () => this.statusBar.setError(),
		});
	}
}
