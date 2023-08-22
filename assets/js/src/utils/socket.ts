// @ts-ignore
import { Socket } from "phoenix";

const opts = {
  params: { token: (window as any).userToken },
};
// if (process.env.NODE_ENV === 'development')
//   opts.logger = (kind, msg, data) => console.log(kind, msg, data)

const socket = new Socket("/socket", opts);

export default socket;
