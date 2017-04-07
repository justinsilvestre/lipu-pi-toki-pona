defmodule Lipu.EnPartOfSpeechTest do
  use Lipu.ModelCase

  alias Lipu.EnPartOfSpeech

  @valid_attrs %{name: "some content"}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = EnPartOfSpeech.changeset(%EnPartOfSpeech{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = EnPartOfSpeech.changeset(%EnPartOfSpeech{}, @invalid_attrs)
    refute changeset.valid?
  end
end
