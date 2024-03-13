import { safeFetch } from "../lib/http"
import { z } from "zod"

export const check = (email: string) =>
  safeFetch({
    method: "GET",
    url: `http://localhost:3000/api/check?email=${email}`,
    schema: z.object({ exists: z.boolean() }),
  })


export const signup = async (user: { email: string, password: string, passwordAgain: string }) =>
  safeFetch({
    method: "POST",
    url: `http://localhost:3000/api/signup`,
    schema: z.object({ id: z.number() }),
    payload: user,
  })
