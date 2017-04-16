defmodule Lipu.TpLemmaView do
  use Lipu.Web, :view

  def render("tp_lemmas.json", %{tp_lemmas: tp_lemmas}) do
    Enum.map(tp_lemmas, &(render("tp_lemma.json", %{tp_lemma: &1})))
  end

  def render("tp_lemma.json", %{tp_lemma: tp_lemma}) do
    %{
      id: tp_lemma.id,
      text: tp_lemma.text,
      pos: tp_lemma.pos.name,
      animacy: tp_lemma.animacy
    }
  end
end
