defmodule Lipu.TpPartOfSpeech do
  use Lipu.Web, :model

  schema "tp_parts_of_speech" do
    field :name, :string

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:name])
    |> validate_required([:name])
  end
end
