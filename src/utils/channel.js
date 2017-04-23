import socket from './socket'

const channel = socket.channel('translate:' + 42)

socket.connect()

export function pull(pushEvent, payload) {
  return new Promise((resolve, reject) => {
      channel.push(pushEvent, payload)
        .receive('ok', resolve)
        .receive('error', reject)
  })
}

export default channel
