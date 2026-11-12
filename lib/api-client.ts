import { treaty } from "@elysia/eden"
import { App } from "@/app/api/[[...slug]]/route"

export const apiClient = treaty<App>("localhost:3000").api

export const getApiClient = (headers?: Headers) =>
  treaty<App>("localhost:3000", { headers }).api
