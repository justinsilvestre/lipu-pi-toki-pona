defmodule LipuWeb.EnLemmaTest do
  use Lipu.ModelCase

  alias LipuWeb.EnLemma

  @valid_attrs %{text: "some content"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = EnLemma.changeset(%EnLemma{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = EnLemma.changeset(%EnLemma{}, @invalid_attrs)
    refute changeset.valid?
  end
end
