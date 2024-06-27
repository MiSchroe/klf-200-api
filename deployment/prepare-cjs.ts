import fs from "fs/promises";
import path from "path";

console.log("Removing directory ./src-cjs");
await fs.rm("./src-cjs", { recursive: true, force: true });

console.log("Copying files from ./src to ./src-cjs");
await fs.cp("./src", "./src-cjs", { recursive: true });

console.log("Overwriting files with cjs versions");
async function* walk(dir: string): AsyncGenerator<string> {
	for await (const d of await fs.opendir(dir)) {
		const entry = path.join(dir, d.name);
		if (d.isDirectory()) yield* walk(entry);
		else if (d.isFile()) yield entry;
	}
}
for await (const filename of walk("./src-cjs")) {
	if (filename.endsWith(".cjs.ts")) {
		const newFileName = `${(<string>filename).slice(0, -7)}.ts`;
		await fs.rename(filename, newFileName);
	}
}
