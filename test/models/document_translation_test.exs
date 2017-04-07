defmodule Lipu.DocumentTranslationTest do
  use Lipu.ModelCase

  alias Lipu.DocumentTranslation

  @valid_attrs %{english: "some content", phrases: []}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = DocumentTranslation.changeset(%DocumentTranslation{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = DocumentTranslation.changeset(%DocumentTranslation{}, @invalid_attrs)
    refute changeset.valid?
  end
end
