export function escapeCsvField(value: string): string {
	if (value.includes(",") || value.includes('"') || value.includes("\n")) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

export function parseCsvRow(line: string): string[] {
	const fields: string[] = [];
	let i = 0;
	while (i <= line.length) {
		if (i === line.length) {
			// trailing empty field after last comma
			break;
		}
		if (line[i] === '"') {
			let field = "";
			i++;
			while (i < line.length) {
				if (line[i] === '"' && line[i + 1] === '"') {
					field += '"';
					i += 2;
				} else if (line[i] === '"') {
					i++;
					break;
				} else {
					field += line[i];
					i++;
				}
			}
			fields.push(field);
			if (i < line.length && line[i] === ",") {
				i++;
			}
		} else {
			const end = line.indexOf(",", i);
			if (end === -1) {
				fields.push(line.slice(i));
				break;
			}
			fields.push(line.slice(i, end));
			i = end + 1;
		}
	}
	return fields;
}

export class CsvRow {
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

export class CsvParser {
	private _headers: string[];

	constructor(headerLine: string) {
		this._headers = parseCsvRow(headerLine);
	}

	get headers(): string[] {
		return this._headers;
	}

	parse(lines: string[]): CsvRow[] {
		return lines.map((line) => new CsvRow(parseCsvRow(line), this._headers));
	}
}
