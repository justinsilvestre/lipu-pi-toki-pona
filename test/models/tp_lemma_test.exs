defmodule LipuWeb.TpLemmaTest do
  use Lipu.ModelCase

  alias LipuWeb.TpLemma

  @valid_attrs %{animacy: true, text: "some content"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = TpLemma.changeset(%TpLemma{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = TpLemma.changeset(%TpLemma{}, @invalid_attrs)
    refute changeset.valid?
  end
end
