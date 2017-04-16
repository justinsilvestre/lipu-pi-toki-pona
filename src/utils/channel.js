import socket from './socket'

socket.connect()
const channel = socket.channel('translate:' + 42)

export function pull(pushEvent, payload) {
  return new Promise((resolve, reject) => {
      channel.push(pushEvent, payload)
        .receive('ok', resolve)
        .receive('error', reject)
  })
}

export default channel
