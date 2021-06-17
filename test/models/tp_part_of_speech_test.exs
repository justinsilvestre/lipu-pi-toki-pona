defmodule LipuWeb.TpPartOfSpeechTest do
  use Lipu.ModelCase

  alias LipuWeb.TpPartOfSpeech

  @valid_attrs %{name: "some content"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = TpPartOfSpeech.changeset(%TpPartOfSpeech{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = TpPartOfSpeech.changeset(%TpPartOfSpeech{}, @invalid_attrs)
    refute changeset.valid?
  end
end
