defmodule LipuWeb.TranslateChannel do
  use LipuWeb, :channel
  alias LipuWeb.PhraseTranslation
  alias LipuWeb.Repo

  def join("translate:" <> number, _params, socket) do
    {:ok, assign(socket, :number, String.to_integer(number))}
  end


  # def handle_in("lookup", %{"pos" => pos_name, "text" => text}, socket) do
  def handle_in("look_up_one",  %{"tpLemmaId" => tp_lemma_id, "enPartsOfSpeech" => en_parts_of_speech}, socket) do
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

    phrase_translation = Phoenix.View.render_one(translation, LipuWeb.PhraseTranslationView, "phrase_translation.json")
    response = %{phraseTranslation: phrase_translation}
    {:reply, {:ok, response}, socket}
  end
  def handle_in("look_up_one",  %{"tpLemmaId" => tp_lemma_id}, socket) do
    for_lemma =
      PhraseTranslation
      |> PhraseTranslation.for_tp_lemma(tp_lemma_id)
    translation = Repo.one(from t in for_lemma, limit: 1, preload: [en_lemma: :pos])

    phrase_translation = Phoenix.View.render_one(translation, LipuWeb.PhraseTranslationView, "phrase_translation.json")

    response = %{phraseTranslation: phrase_translation}

    {:reply, {:ok, response}, socket}
  end

  def handle_in("look_up_many", %{"tpLemmaId" => tp_lemma_id}, socket) do
    for_lemma =
      PhraseTranslation
      |> PhraseTranslation.for_tp_lemma(tp_lemma_id)
    translations = Repo.all(from t in for_lemma, preload: [en_lemma: :pos])

    phrase_translations = Phoenix.View.render_many(translations, LipuWeb.PhraseTranslationView, "phrase_translation.json")

    response = %{phraseTranslations: phrase_translations}

    {:reply, {:ok, response}, socket}
  end
  def handle_in("look_up_many", %{"tpLemmaId" => tp_lemma_id, "enPartsOfSpeech" => en_parts_of_speech}, socket) do
    for_lemma =
      PhraseTranslation
      |> PhraseTranslation.for_tp_lemma(tp_lemma_id)
    translations = Repo.all(from t in for_lemma,
      join: e in assoc(t, :en_lemma),
      join: p in assoc(e, :pos),
      where: p.name in ^en_parts_of_speech,
      preload: [en_lemma: :pos]
    )
    phrase_translations = Phoenix.View.render_many(translations, LipuWeb.PhraseTranslationView, "phrase_translation.json")

    response = %{phraseTranslations: phrase_translations}

    {:reply, {:ok, response}, socket}
  end
end
