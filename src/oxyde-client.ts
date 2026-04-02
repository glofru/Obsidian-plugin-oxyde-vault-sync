export interface RevisionFile {
	path: string;
	content: string;
}

export interface RevisionResponse {
	revisionId: string;
	files: RevisionFile[];
	nextPage: string | null;
}

export class OxydeClient {
	constructor(private baseUrl: string) {}

	async getLatestRevision(page?: string): Promise<RevisionResponse> {
		const url = new URL(`${this.baseUrl}/api/v1/revisions/latest`);
		if (page) {
			url.searchParams.set("page", page);
		}

		const response = await fetch(url.toString());
		if (!response.ok) {
			throw new Error(
				`Oxyde Vault request failed: ${response.status} ${response.statusText}`
			);
		}

		return response.json() as Promise<RevisionResponse>;
	}

	/** Yields each page of the latest revision as it arrives. */
	async *getLatestRevisionPages(): AsyncGenerator<RevisionResponse> {
		let page: string | undefined;

		do {
			const chunk = await this.getLatestRevision(page);
			yield chunk;
			page = chunk.nextPage ?? undefined;
		} while (page);
	}
}
