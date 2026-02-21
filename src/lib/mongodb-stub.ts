/**
 * Client-side stub for the mongodb driver.
 * Server-side code uses the real mongodb package via ssr.external.
 * This stub prevents Vite from bundling the real driver into the client.
 */
export class ObjectId {
  constructor(public id?: string) {
    this.id = id ?? ''
  }
  toString() {
    return this.id ?? ''
  }
  toHexString() {
    return this.id ?? ''
  }
}

export class MongoClient {
  static connect() {
    throw new Error('MongoClient is not available on the client')
  }
  connect() {
    throw new Error('MongoClient is not available on the client')
  }
  db() {
    throw new Error('MongoClient is not available on the client')
  }
}

export type Db = any
export default {}
