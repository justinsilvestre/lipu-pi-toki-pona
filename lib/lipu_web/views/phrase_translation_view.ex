defmodule LipuWeb.PhraseTranslationView do
  use LipuWeb, :view

  def render("phrase_translation.json", %{phrase_translation: translation}) do
    %{
      id: translation.id,
      tp: translation.tp_lemma_id,
      en: render_one(translation.en_lemma, LipuWeb.EnLemmaView, "en_lemma.json"),
    }
  end
end
