defmodule LipuWeb.DocumentTranslation do
  use LipuWeb, :model

  schema "document_translations" do
    field :phrases, {:array, :string}
    field :english, :string
    belongs_to :tp_document, Lipu.TpDocument

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:phrases, :english])
    |> validate_required([:phrases, :english])
  end
end
