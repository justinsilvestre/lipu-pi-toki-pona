defmodule Lipu.TranslateChannel do
  use Lipu.Web, :channel
  alias Lipu.PhraseTranslation
  alias Lipu.EnLemma

  def join("translate:" <> number, _params, socket) do
    :timer.send_interval(5_000, :ping)
    {:ok, assign(socket, :number, String.to_integer(number))}
  end

  def handle_info(:ping, socket) do
    count = socket.assigns[:count] || 1
    push socket, "ping", %{count: count}

    {:noreply, assign(socket, :count, count + 1)}
  end

  # def handle_in("lookup", %{"pos" => pos_name, "text" => text}, socket) do
  def handle_in("lookup",  %{"tpLemmaId" => tp_lemma_id, "enPartsOfSpeech" => en_parts_of_speech}, socket) do
    for_lemma =
      PhraseTranslation
      |> PhraseTranslation.for_tp_lemma(tp_lemma_id)
    translation = Repo.one(from t in for_lemma,
      limit: 1,
      join: e in assoc(t, :en_lemma),
      join: p in assoc(e, :pos),
      where: p.name in ^en_parts_of_speech,
      preload: [en_lemma: :pos]
    )

    phrase_translation = Phoenix.View.render_one(translation, Lipu.PhraseTranslationView, "phrase_translation.json")

    response = %{phraseTranslation: phrase_translation}

    push socket, "lookup_success:#{tp_lemma_id}", response
    {:reply, :ok, socket}
  end
end
