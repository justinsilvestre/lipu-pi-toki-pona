defmodule LipuWeb.TpRoleView do
  use Lipu.Web, :view

  def render("index.json", %{tp_roles: tp_roles}) do
    Enum.map(tp_roles, &(render("show.json", %{tp_role: &1})))
  end

  def render("show.json", %{tp_role: tp_role}) do
    %{
      id: tp_role.id,
      name: tp_role.name,
    }
  end
end
