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

  def by_part_of_speech(query, parts_of_speech) do
    from x in query,
      join: pos in assoc(x, :pos),
      where: pos.name in ^parts_of_speech
  end
end
