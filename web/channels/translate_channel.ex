defmodule Lipu.TranslateChannel do
  use Lipu.Web, :channel
  alias Lipu.PhraseTranslation

  def join("translate:" <> number, _params, socket) do
    :timer.send_interval(5_000, :ping)
    {:ok, assign(socket, :number, String.to_integer(number))}
  end

  def handle_info(:ping, socket) do
    count = socket.assigns[:count] || 1
    push socket, "ping", %{count: count}

    {:noreply, assign(socket, :count, count + 1)}
  end

  def handle_in("lookup", %{"text" => text, "pos" => pos_name}, socket) do
    translations = PhraseTranslation.lookup(text, pos_name)
    # push socket, "lookup_success", %{t: Enum.map(translations, &(&1.en_text)}
    response = %{translations: Phoenix.View.render_many(translations, Lipu.PhraseTranslationView, "phrase_translation.json")}
    push socket, "lookup_success", response
    {:reply, :ok, socket}
  end
end
