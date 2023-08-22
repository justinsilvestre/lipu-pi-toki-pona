defmodule LipuWeb.PhraseTranslationTest do
  use Lipu.ModelCase

  alias LipuWeb.PhraseTranslation

  @valid_attrs %{default_uses: 42, uses: 42}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = PhraseTranslation.changeset(%PhraseTranslation{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = PhraseTranslation.changeset(%PhraseTranslation{}, @invalid_attrs)
    refute changeset.valid?
  end
end
