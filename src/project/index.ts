import fs from "fs/promises"
import path from "path"
import { ProjectType } from "../types/index.js"
import { getProjectFile } from "../config/index.js"

export async function detectProjectType(projectRoot: string): Promise<ProjectType> {
  try {
    await fs.access(path.join(projectRoot, "pubspec.yaml"))
    return "flutter"
  } catch {
    try {
      await fs.access(path.join(projectRoot, "package.json"))
      return "node"
    } catch {
      throw new Error(
        "Unsupported project type. Only Flutter (pubspec.yaml) and Node.js (package.json) are supported."
      )
    }
  }
}

export async function saveProjectType(projectRoot: string): Promise<void> {
  const projectType = await detectProjectType(projectRoot)
  const projectConfig = { projectType }
  await fs.writeFile(getProjectFile(projectRoot), JSON.stringify(projectConfig, null, 2), "utf-8")
}
