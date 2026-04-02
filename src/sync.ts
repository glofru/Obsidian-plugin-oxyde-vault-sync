import { Notice, Vault } from "obsidian";
import { OxydeClient } from "./oxyde-client";

export interface SyncCallbacks {
	onStart: () => void;
	onProgress: (processed: number) => void;
	onDone: () => void;
	onError: () => void;
}

export async function performSync(
	vaultUrl: string,
	vault: Vault,
	callbacks?: Partial<SyncCallbacks>
): Promise<void> {
	if (!vaultUrl) {
		new Notice("Oxyde Vault Sync: no vault URL configured.");
		return;
	}

	try {
		new Notice("Oxyde Vault Sync: syncing…");
		callbacks?.onStart?.();

		const client = new OxydeClient(vaultUrl);

		let revisionId = "";
		let totalFiles = 0;

		for await (const page of client.getLatestRevisionPages()) {
			revisionId = page.revisionId;

			for (const file of page.files) {
				try {
					// Normalize base64url → standard base64 and restore padding
					const b64 = file.content
						.replace(/-/g, "+")
						.replace(/_/g, "/")
						.padEnd(Math.ceil(file.content.length / 4) * 4, "=");
					const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

					// Ensure parent directories exist
					const dir = file.path.substring(0, file.path.lastIndexOf("/"));
					if (dir) {
						await vault.adapter.mkdir(dir);
					}

					await vault.adapter.writeBinary(file.path, bytes.buffer);
					totalFiles++;
					callbacks?.onProgress?.(totalFiles);
				} catch (err) {
					console.error(`FAILED ${file.path} because `, err);
				}
			}
		}

		callbacks?.onDone?.();
		new Notice(`Oxyde Vault Sync: synced revision ${revisionId} (${totalFiles} files).`);
	} catch (err) {
		console.error("Oxyde Vault Sync error:", err);
		callbacks?.onError?.();
		new Notice(`Oxyde Vault Sync: sync failed — ${(err as Error).message}`);
	}
}
