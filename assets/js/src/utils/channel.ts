// @ts-ignore
import { Socket } from "phoenix";
const opts = {
  params: { token: (globalThis as any).userToken },
};
// if (process.env.NODE_ENV === 'development')
//   opts.logger = (kind, msg, data) => console.log(kind, msg, data)

const context = {
  socket: null as Socket,
  channel: null as ReturnType<Socket["channel"]>,
};

export function connect() {
  context.socket = new Socket("/socket", opts);
  context.channel = context.socket.channel("translate:" + 42);

  context.socket.connect();

  context.channel
    .join()
    .receive("ok", (r) => {
      console.log("join OK");
    })
    .receive("error", (reason) => console.log("join failed :(", reason));
}

export function pull(pushEvent, payload) {
  return new Promise((resolve, reject) => {
    context.channel
      .push(pushEvent, payload)
      .receive("ok", resolve)
      .receive("error", reject);
  });
}
