defmodule LipuWeb.TpLemmaController do
  use LipuWeb, :controller

  def index(conn, _params) do
    tp_lemmas =
      Lipu.TpLemma
      |> Repo.all
      |> Repo.preload(:pos)

    render conn, "tp_lemmas.json", %{tp_lemmas: tp_lemmas}
  end
end
