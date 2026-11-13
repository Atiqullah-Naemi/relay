import { ExecutionLog, Run } from "@/types"

export function createRunLog(userId: string, run: Run): ExecutionLog {
  return async (message) => {
    run.logs = [...run.logs, message]
  }
}
