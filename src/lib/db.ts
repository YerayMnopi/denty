import { MongoClient, type Db } from 'mongodb'

const uri = process.env.MONGODB_URI

let client: MongoClient | null = null
let connected = false

export async function connectToDatabase(): Promise<Db> {
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables')
  }

  if (!connected || !client) {
    try {
      client = new MongoClient(uri)
      await client.connect()
      connected = true
    } catch (error) {
      connected = false
      client = null
      throw new Error(
        `Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  return client.db('denty')
}

export async function getDb(): Promise<Db> {
  return connectToDatabase()
}
