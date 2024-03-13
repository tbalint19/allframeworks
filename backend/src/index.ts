import express from "express"
import cors from "cors"
import { z } from "zod"
import fs from "fs/promises"

const app = express()

app.use(cors())
app.use(express.json())

type User = {
  id: number
  email: string
  password: string
}

const loadDB = async (filename: string) => {
  try {
    const rawData = await fs.readFile(`${__dirname}/../database/${filename}.json`, 'utf-8')
    const data = JSON.parse(rawData)
    return data as User[]
  } catch (error) {
    return null
  }
}

const saveDB = async (filename: string, data: any) => {
  try {
    const fileContent = JSON.stringify(data)
    await fs.writeFile(`${__dirname}/../database/${filename}.json`, fileContent)
    return true
  } catch (error) {
    return false
  }
}

const QueryParams = z.object({
  email: z.string().email()
})

app.get("/api/check", async (req, res) => {

  const result = QueryParams.safeParse(req.query)
  if (!result.success)
    return res.sendStatus(400)
  const queryParams = result.data

  const users = await loadDB("users")
  if (!users)
    return res.sendStatus(500)

  const userAlreadyExists = users.some(user => user.email === queryParams.email)

  res.json({ exists: userAlreadyExists })
})

const PostRequest = z.object({
  email: z.string().email(),
  password: z.string().min(5),
  passwordAgain: z.string(),
})

app.post("/api/signup", async (req, res) => {

  const result = PostRequest.safeParse(req.body)
  if (!result.success)
    return res.sendStatus(400)
  const postData = result.data
  const { email, password, passwordAgain } = postData

  if (password !== passwordAgain)
    return res.sendStatus(400)

  const users = await loadDB("users")
  if (!users)
    return res.sendStatus(500)

  const userAlreadyExists = users.some(user => user.email === email)
  if (userAlreadyExists)
    return res.sendStatus(409)

  const id = Math.random()
  const isSuccessful = await saveDB("users", [ ...users, { id, email, password } ])

  if (!isSuccessful)
    return res.sendStatus(500)

  res.json({ id })
})

app.listen(3000)
