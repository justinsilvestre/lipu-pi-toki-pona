defmodule Lipu.TpLemma do
  use Lipu.Web, :model

  schema "tp_lemmas" do
    field :text, :string
    field :animacy, :boolean, default: false
    belongs_to :pos, Lipu.Pos
    belongs_to :primary, Lipu.Primary

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:text, :animacy])
    |> validate_required([:text, :animacy])
  end
end
