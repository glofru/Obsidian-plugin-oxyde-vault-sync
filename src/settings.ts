import { App, PluginSettingTab, Setting } from "obsidian";
import OxydeVaultSyncPlugin from "./main";

export interface OxydeVaultSyncSettings {
	vaultUrl: string;
	syncIntervalMinutes: number; // 0 = disabled
}

export const DEFAULT_SETTINGS: OxydeVaultSyncSettings = {
	vaultUrl: "",
	syncIntervalMinutes: 0,
};

export class OxydeVaultSyncSettingTab extends PluginSettingTab {
	plugin: OxydeVaultSyncPlugin;

	constructor(app: App, plugin: OxydeVaultSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Oxyde Vault Sync" });

		new Setting(containerEl)
			.setName("Vault URL")
			.setDesc("Base URL of your Oxyde Vault instance (e.g. https://vault.example.com).")
			.addText((text) =>
				text
					.setPlaceholder("https://vault.example.com")
					.setValue(this.plugin.settings.vaultUrl)
					.onChange(async (value) => {
						this.plugin.settings.vaultUrl = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Auto sync interval (minutes)")
			.setDesc("How often to sync automatically. Set to 0 to disable auto sync.")
			.addText((text) =>
				text
					.setPlaceholder("0")
					.setValue(String(this.plugin.settings.syncIntervalMinutes))
					.onChange(async (value) => {
						const parsed = parseInt(value, 10);
						this.plugin.settings.syncIntervalMinutes =
							isNaN(parsed) || parsed < 0 ? 0 : parsed;
						await this.plugin.saveSettings();
						this.plugin.restartAutoSync();
					})
			);
	}
}
