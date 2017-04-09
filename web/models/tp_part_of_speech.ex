defmodule Lipu.TpPartOfSpeech do
  use Lipu.Web, :model

  schema "tp_parts_of_speech" do
    field :name, :string
    has_many :tp_lemmas, Lipu.TpLemma, foreign_key: :pos_id

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
