defmodule LipuWeb.PageController do
  use Lipu.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
