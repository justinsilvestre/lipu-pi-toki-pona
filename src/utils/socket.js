import { Socket } from 'phoenix'

const url = process.env.NODE_ENV === 'production' ? '/socket' : 'ws://localhost:4000/socket'

let socket = new Socket(url, {
  params: { token: window.userToken },
  logger: (kind, msg, data) => console.log(`${kind}: ${msg}, data`),
})

export default socket
