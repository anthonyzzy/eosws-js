import { ActionTrace } from "./types/action_trace"
import { Ping } from "./types/ping"
import { TableRows } from "./types/table_rows"
export { ActionTrace, Ping, TableRows }

/**
 * Data represents the message payload received over the WebSocket.
 *
 * @private
 */
type WebSocketData = string | Buffer | ArrayBuffer | Buffer[]

/**
 * Get Actions
 *
 * @param {string} account Account
 * @param {string} action_name Action Name
 * @param {string} [receiver] Receiver
 * @param {string} [options.req_id] Request ID
 * @param {number} [options.start_block] Start at block number
 * @param {boolean} [options.fetch] Fetch initial request
 * @returns {string} Message for `ws.send`
 * @example
 *
 * ws.send(get_actions("eosio.token", "transfer"));
 */
export function get_actions(
  account: string,
  action_name: string,
  receiver?: string,
  options: {
    req_id?: string
    start_block?: number
    fetch?: boolean
  } = {}
) {
  const req_id = options.req_id ? options.req_id : generateReqId()
  const start_block = options.start_block
  const fetch = options.fetch

  return JSON.stringify({
    type: "get_actions",
    req_id,
    listen: true,
    fetch,
    start_block,
    data: {
      account,
      action_name,
      receiver
    }
  })
}

/**
 * Get Transaction (NOT STABLE YET)
 *
 * @private
 * @param {string} account Account
 * @param {string} action_name Action Name
 * @param {string} [receiver] Receiver
 * @param {object} [options={}] Optional parameters
 * @param {string} [options.req_id] Request ID
 * @param {number} [options.start_block] Start at block number
 * @param {boolean} [options.fetch] Fetch initial request
 * @returns {string} Message for `ws.send`
 * @example
 *
 * ws.send(get_transaction("517...86d"));
 */
export function get_transaction(
  trx_id: string,
  options: {
    req_id?: string
    start_block?: number
    fetch?: boolean
  } = {}
) {
  const req_id = options.req_id ? options.req_id : generateReqId()
  const start_block = options.start_block
  const fetch = options.fetch

  return JSON.stringify({
    type: "get_transaction",
    req_id,
    listen: true,
    fetch,
    start_block,
    data: {
      id: trx_id
    }
  })
}

/**
 * Get Table Deltas
 *
 * @param {string} code Code
 * @param {string} scope Scope
 * @param {string} table_name Table Name
 * @param {object} [options={}] Optional parameters
 * @param {string} [options.req_id] Request ID
 * @param {number} [options.start_block] Start at block number
 * @param {boolean} [options.fetch] Fetch initial request
 * @returns {string} Message for `ws.send`
 * @example
 *
 * ws.send(get_table_rows("eosio", "eosio", "global"));
 */
export function get_table_rows(
  code: string,
  scope: string,
  table_name: string,
  options: {
    req_id?: string
    start_block?: number
    fetch?: boolean
  } = {}
) {
  const req_id = options.req_id ? options.req_id : generateReqId()
  const start_block = options.start_block
  const fetch = options.fetch

  return JSON.stringify({
    type: "get_table_rows",
    req_id,
    listen: true,
    fetch,
    start_block,
    data: {
      code,
      scope,
      table_name,
      json: true
    }
  })
}

/**
 * Unlisten to WebSocket based on request id
 *
 * @param {string} req_id Request ID
 * @example
 *
 * ws.send(unlisten("req123"));
 */
export function unlisten(req_id: string) {
  if (!req_id) {
    throw new Error("req_id is required")
  }

  return JSON.stringify({
    type: "unlisten",
    data: {
      req_id
    }
  })
}

/**
 * Generate Req ID
 *
 * @returns {string} Request ID
 * @example
 *
 * generateReqId() // => req123
 */
export function generateReqId() {
  return "req" + Math.round(Math.random() * 1000)
}

/**
 * Parse Actions from `get_actions` from WebSocket `onmessage` listener
 *
 * @param {WebSocketData} data WebSocket Data from message event
 * @param {string} [req_id] Request ID
 * @returns {ActionTrace} Action Trace
 * @example
 *
 * const actions = parse_actions<any>(message);
 */
export function parse_actions<T>(data: WebSocketData, req_id?: string): ActionTrace<T> | null {
  const message = parse_message(data)
  if (message.type === "action_trace") {
    if (req_id && message.req_id !== req_id) {
      return null
    }
    return message
  }
  return null
}

/**
 * Parse Table Deltas from `get_table_rows` from WebSocket `onmessage` listener
 *
 * @param {WebSocketData} data WebSocket Data from message event
 * @param {string} [req_id] Request ID
 * @returns {ActionTrace} Action Trace
 * @example
 *
 * const table_deltas = parse_table_rows<any>(message);
 */
export function parse_table_rows<T>(data: WebSocketData, req_id?: string): TableRows<T> | null {
  const message = parse_message(data)
  if (message.type === "table_rows" || message.type === "table_delta") {
    if (req_id && message.req_id !== req_id) {
      return null
    }
    return message
  }
  return null
}

/**
 * Parse Ping from WebSocket `onmessage` listener
 *
 * @param {WebSocketData} data WebSocket Data from message event
 * @returns {Ping} Ping
 * @example
 *
 * const ping = parse_ping(message);
 */
export function parse_ping(data: WebSocketData): Ping | null {
  const message = parse_message(data)
  if (message.type === "ping") {
    return message
  }
  return null
}

/**
 * Parse MessageEvent from WebSocket `onmessage` listener
 *
 * @private
 * @param {WebSocketData} data WebSocket Data from message event
 * @returns {Object} Message Data
 */
export function parse_message(data: WebSocketData): any {
  return JSON.parse(data.toString())
}
