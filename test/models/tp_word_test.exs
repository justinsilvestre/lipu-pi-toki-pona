defmodule Lipu.TpWordTest do
  use Lipu.ModelCase

  alias Lipu.TpWord

  @valid_attrs %{after: "some content", anu: true, before: "some content", context: 42, id: "7488a646-e31f-11e4-aace-600308960662"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = TpWord.changeset(%TpWord{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = TpWord.changeset(%TpWord{}, @invalid_attrs)
    refute changeset.valid?
  end
end
