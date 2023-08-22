defmodule LipuWeb.TpLemmaController do
  use LipuWeb, :controller

  alias Lipu.Repo

  def index(conn, _params) do
    tp_lemmas =
      LipuWeb.TpLemma
      |> Repo.all
      |> Repo.preload(:pos)

    render conn, "tp_lemmas.json", %{tp_lemmas: tp_lemmas}
  end
end
