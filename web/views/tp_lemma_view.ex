defmodule Lipu.TpLemmaView do
  use Lipu.Web, :view

  def render("tp_lemma.json", %{tp_lemma: tp_lemma}) do
    %{
      id: tp_lemma.id,
      text: tp_lemma.text,
      pos: tp_lemma.pos.name,
      animacy: tp_lemma.animacy
    }
  end
end
