defmodule LipuWeb.TpRoleTest do
  use Lipu.ModelCase

  alias LipuWeb.TpRole

  @valid_attrs %{name: "some content"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = TpRole.changeset(%TpRole{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = TpRole.changeset(%TpRole{}, @invalid_attrs)
    refute changeset.valid?
  end
end
