defmodule Lipu.EnLemma do
  use Lipu.Web, :model

  schema "en_lemmas" do
    field :text, :string
    belongs_to :pos, Lipu.Pos

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:text])
    |> validate_required([:text])
  end
end
