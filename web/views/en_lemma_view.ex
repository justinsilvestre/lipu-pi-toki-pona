defmodule Lipu.EnLemmaView do
  use Lipu.Web, :view

  def render("en_lemma.json", %{en_lemma: en_lemma}) do
    %{
      id: en_lemma.id,
      text: en_lemma.text,
      pos: en_lemma.pos.name
    }
  end
end
