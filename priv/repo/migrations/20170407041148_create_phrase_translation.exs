defmodule Lipu.Repo.Migrations.CreatePhraseTranslation do
  use Ecto.Migration

  def change do
    create table(:phrase_translations) do
      add :uses, :integer, default: 0
      add :default_uses, :integer, default: 0
      add :tp_lemma_id, references(:tp_lemmas, on_delete: :nothing), null: false
      add :en_lemma_id, references(:en_lemmas, on_delete: :nothing), null: false

      timestamps()
    end
    create index(:phrase_translations, [:tp_lemma_id])
    create index(:phrase_translations, [:en_lemma_id])
    create unique_index(:phrase_translations, [:tp_lemma_id, :en_lemma_id])
  end
end
