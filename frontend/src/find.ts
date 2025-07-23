import fs from "node:fs";
import path from "node:path";
// ディレクトリ直下のファイルまたはディレクトリまたは両方を列挙する、ファイルなら拡張子もis_file=.ya,;
export type FoundEntry=fs.Dirent<string>
export default function find(path_directory: string, recursive: boolean, options?:{
	type_f?: boolean,
	type_d?: boolean,
	extention?: string
}): fs.Dirent<string>[]{
	const entries = fs.readdirSync(path_directory, {
		withFileTypes: true,
		recursive: recursive,
	});
	return entries.filter(entry => 
		(!options?.type_f || entry.isFile())
		&& (!options?.type_d || entry.isDirectory())
		&& (!options?.extention || path.extname(entry.name) === options?.extention)
	);
}
export function readTextSync(path: string): string {
	return fs.readFileSync(path, 'utf-8');
}

export function readDirentTextSync(entry: FoundEntry, childname?: string): string {
	const l=[entry.parentPath, entry.name]
	const l2=childname?[...l, childname]:l
	return readTextSync(path.join(...l2))
}