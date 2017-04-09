defmodule Lipu.EnLemma do
  use Lipu.Web, :model

  schema "en_lemmas" do
    field :text, :string
    belongs_to :pos, Lipu.EnPartOfSpeech

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:text, :pos_id])
    |> validate_required([:text, :pos_id])
  end
end
