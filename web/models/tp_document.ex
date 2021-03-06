defmodule Lipu.TpDocument do
  use Lipu.Web, :model

  schema "tp_documents" do
    field :tp_word_ids, {:array, :string}

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:tp_word_ids])
    |> validate_required([:tp_word_ids])
  end
end
