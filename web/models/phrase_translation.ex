defmodule Lipu.PhraseTranslation do
  use Lipu.Web, :model

  schema "phrase_translations" do
    field :uses, :integer
    field :default_uses, :integer
    belongs_to :tp_lemma, Lipu.TpLemma
    belongs_to :en_lemma, Lipu.EnLemma

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:uses, :default_uses])
    |> validate_required([:uses, :default_uses])
  end
end
