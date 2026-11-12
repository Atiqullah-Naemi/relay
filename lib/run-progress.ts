import { ExecutionLog, Run } from "@/types"

export function createRunLog(userId: string, run: Run): ExecutionLog {
  return async (message, options) => {
    run.logs.push(message)
  }
}
