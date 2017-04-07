defmodule Lipu.TpDocumentTest do
  use Lipu.ModelCase

  alias Lipu.TpDocument

  @valid_attrs %{tp_word_ids: []}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = TpDocument.changeset(%TpDocument{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = TpDocument.changeset(%TpDocument{}, @invalid_attrs)
    refute changeset.valid?
  end
end
