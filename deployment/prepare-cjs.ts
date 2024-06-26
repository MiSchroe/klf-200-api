import fs from "fs/promises";

console.log("Removing directory ./src-cjs");
await fs.rm("./src-cjs", { recursive: true, force: true });

console.log("Copying files from ./src to ./src-cjs");
await fs.cp("./src", "./src-cjs", { recursive: true });

console.log("Overwriting files with cjs versions");
for await (const filename: string of fs.glob("./src-cjs/**/*.cjs.ts")) {
	const newFileName = `${(<string>filename).slice(0, -7)}.ts`;
	await fs.rename(filename, newFileName);
}
