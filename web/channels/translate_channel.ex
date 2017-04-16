defmodule Lipu.TranslateChannel do
  use Lipu.Web, :channel
  alias Lipu.PhraseTranslation
  alias Lipu.EnLemma

  def join("translate:" <> number, _params, socket) do
    {:ok, assign(socket, :number, String.to_integer(number))}
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
    {:reply, {:ok, %{phraseTranslation: phrase_translation}}, socket}
  end
  def handle_in("lookup",  %{"tpLemmaId" => tp_lemma_id}, socket) do
    for_lemma =
      PhraseTranslation
      |> PhraseTranslation.for_tp_lemma(tp_lemma_id)
    translation = Repo.one(from t in for_lemma, limit: 1, preload: [en_lemma: :pos])

    phrase_translation = Phoenix.View.render_one(translation, Lipu.PhraseTranslationView, "phrase_translation.json")

    response = %{phraseTranslation: phrase_translation}

    {:reply, {:ok, %{phraseTranslation: phrase_translation}}, socket}
  end
end
