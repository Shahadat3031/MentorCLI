import fs from "fs/promises"
import path from "path"

export interface FileBlock {
  filePath: string
  content: string
}

export function parseFileBlocks(content: string): FileBlock[] {
  const blocks: FileBlock[] = []
  const regex = /=== ([^\n]+) ===\n(?:```[a-zA-Z]*\n)?([\s\S]*?)(?:```)?(?=\n=== |\n```json|$)/g
  let match
  while ((match = regex.exec(content)) !== null) {
    const filePath = match[1].trim()
    const fileContent = match[2].trim()
    if (filePath && fileContent) {
      blocks.push({ filePath, content: fileContent })
    }
  }
  return blocks
}

export async function writeFiles(blocks: FileBlock[], baseDir: string): Promise<string[]> {
  const written: string[] = []
  const resolvedBase = path.resolve(baseDir)
  for (const block of blocks) {
    const safePath = block.filePath.replace(/^[/\\]+/, "")
    const fullPath = path.resolve(resolvedBase, safePath)
    if (!fullPath.startsWith(resolvedBase + path.sep) && fullPath !== resolvedBase) {
      throw new Error(`Path escape attempt blocked: ${block.filePath}`)
    }
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    await fs.writeFile(fullPath, block.content, "utf-8")
    written.push(safePath)
  }
  return written
}
