defmodule Lipu.PhraseTranslation do
  use Lipu.Web, :model
  alias Lipu.TpPartOfSpeech, as: TpPos
  alias Lipu.TpLemma
  alias Lipu.Repo

  schema "phrase_translations" do
    field :uses, :integer
    field :default_uses, :integer
    belongs_to :tp_lemma, Lipu.TpLemma
    belongs_to :en_lemma, Lipu.EnLemma

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:uses, :default_uses])
    |> validate_required([:uses, :default_uses])
  end

  def look_up(text, pos_name) do
    pos = TpPos.get(pos_name)
    tp_lemma = Repo.get_by(TpLemma, text: text, pos_id: pos.id)
    Repo.all(from x in Lipu.PhraseTranslation,
      where: x.tp_lemma_id == ^tp_lemma.id,
      preload: [tp_lemma: :pos, en_lemma: :pos])
  end

  def look_up_one(tp_lemma_id) do
    Repo.one(from x in Lipu.PhraseTranslation,
      where: x.tp_lemma_id == ^tp_lemma_id,
      limit: 1,
      preload: [en_lemma: :pos, en_lemma: :pos]
    )
  end

  def for_tp_lemma(query, tp_lemma_id) do
    from x in query,
      where: x.tp_lemma_id == ^tp_lemma_id
  end
end
