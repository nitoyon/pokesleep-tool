export class TsvRow {
	private cols: string[];
	private headers: string[];

	constructor(cols: string[], headers: string[]) {
		this.cols = cols;
		this.headers = headers;
	}

	get(columnName: string): string {
		const idx = this.headers.indexOf(columnName);
		if (idx === -1) {
			return "";
		}
		return idx < this.cols.length ? this.cols[idx] : "";
	}
}

export class TsvParser {
	private _headers: string[];

	constructor(headerLine: string) {
		this._headers = headerLine.split("\t");
	}

	get headers(): string[] {
		return this._headers;
	}

	parse(lines: string[]): TsvRow[] {
		return lines.map((line) => new TsvRow(line.split("\t"), this._headers));
	}
}
