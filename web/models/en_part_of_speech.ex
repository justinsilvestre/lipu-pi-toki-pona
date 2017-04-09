defmodule Lipu.EnPartOfSpeech do
  use Lipu.Web, :model

  schema "en_parts_of_speech" do
    field :name, :string
    has_many :en_lemmas, Lipu.EnLemma, foreign_key: :pos_id

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
