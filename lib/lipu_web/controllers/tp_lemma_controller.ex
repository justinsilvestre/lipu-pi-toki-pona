defmodule LipuWeb.TpLemmaController do
  use Lipu.Web, :controller

  def index(conn, _params) do
    tp_lemmas =
      LipuWeb.TpLemma
      |> Repo.all
      |> Repo.preload(:pos)

    render conn, "tp_lemmas.json", %{tp_lemmas: tp_lemmas}
  end
end
