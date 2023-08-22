defmodule LipuWeb.PageController do
  use LipuWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
