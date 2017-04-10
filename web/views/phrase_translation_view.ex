defmodule Lipu.PhraseTranslationView do
  use Lipu.Web, :view

  def render("phrase_translation.json", %{phrase_translation: translation}) do
    %{
      id: translation.id,
      tp: render_one(translation.tp_lemma, Lipu.TpLemmaView, "tp_lemma.json"),
      en: render_one(translation.en_lemma, Lipu.EnLemmaView, "en_lemma.json")
    }
  end
end
