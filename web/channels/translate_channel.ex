defmodule Lipu.TranslateChannel do
  use Lipu.Web, :channel

  def join("translate:" <> number, _params, socket) do
    :timer.send_interval(5_000, :ping)
    {:ok, assign(socket, :number, String.to_integer(number))}
  end

  def handle_info(:ping, socket) do
    count = socket.assigns[:count] || 1
    push socket, "ping", %{count: count}

    {:noreply, assign(socket, :count, count + 1)}
  end
end
