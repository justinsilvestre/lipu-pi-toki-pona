import socket from './socket'

socket.connect()
const channel = socket.channel('translate:' + 42)

export function pull(awaitedEvent, pushEvent, payload) {
  return new Promise((resolve, reject) => {
    try {
      channel.on(awaitedEvent, (response) => {
        channel.off(awaitedEvent)
        resolve(response)
      })
      channel.push(pushEvent, payload)
    } catch (err) {
      reject(err)
    }
  })
}

export default channel
