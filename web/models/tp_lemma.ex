defmodule Lipu.TpLemma do
  use Lipu.Web, :model

  schema "tp_lemmas" do
    field :text, :string
    field :animacy, :boolean
    belongs_to :pos, Lipu.TpPartOfSpeech
    belongs_to :primary, Lipu.TpLemma
    has_one :secondary, Lipu.TpLemma, foreign_key: :primary_id

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:text, :animacy, :pos_id, :primary_id])
    |> validate_required([:text, :pos_id])
  end
end
