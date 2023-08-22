defmodule LipuWeb.TpLemma do
  use LipuWeb, :model
  alias Lipu.Repo

  schema "tp_lemmas" do
    field :text, :string
    field :animacy, :boolean
    belongs_to :pos, LipuWeb.TpPartOfSpeech
    belongs_to :primary, LipuWeb.TpLemma
    has_one :secondary, LipuWeb.TpLemma, foreign_key: :primary_id

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
