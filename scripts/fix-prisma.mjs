import { readdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

const snapshotsDir = join(process.cwd(), "migrations", "snapshots")

const directories = await readdir(snapshotsDir, {
  withFileTypes: true,
})

for (const directory of directories) {
  if (!directory.isDirectory()) continue

  const path = join(snapshotsDir, directory.name, "contract.json")
  const contract = JSON.parse(await readFile(path, "utf8"))

  let updated = 0

  for (const item of contract.execution?.mutations?.defaults ?? []) {
    const ref = item.ref

    if (!ref) continue

    if ("table" in ref) {
      ref.entry = ref.table
      delete ref.table
      updated++
    }

    if ("column" in ref) {
      ref.field = ref.column
      delete ref.column
      updated++
    }
  }

  if (updated > 0) {
    await writeFile(path, JSON.stringify(contract, null, 2) + "\n")
  }

  console.log(`${directory.name}: ${updated} changes`)
}
