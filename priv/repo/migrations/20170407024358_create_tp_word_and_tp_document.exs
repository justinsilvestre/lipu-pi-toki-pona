defmodule Lipu.Repo.Migrations.CreateTpWord do
  use Ecto.Migration

  def change do
    create table(:tp_documents) do
      add :tp_word_ids, {:array, :uuid}, null: false

      timestamps()
    end

    create table(:tp_words, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :before, :string
      add :after, :string
      add :context, :integer
      add :anu, :boolean, default: false, null: false
      add :lemma_id, references(:tp_lemmas, on_delete: :nothing), null: false
      add :role, references(:tp_roles, on_delete: :nothing), null: false
      add :document_id, references(:tp_documents, on_delete: :delete_all), null: false
      add :head, references(:tp_words, on_delete: :nothing, type: :uuid)
      add :complements, {:array, :uuid}
      add :parent, references(:tp_words, on_delete: :nothing, type: :uuid)
      add :direct_objects, {:array, :uuid}
      add :prepositional_object, references(:tp_words, on_delete: :nothing, type: :uuid)

      timestamps()
    end
    create index(:tp_words, [:lemma_id])
    create index(:tp_words, [:role])
    create index(:tp_words, [:document_id])
    create index(:tp_words, [:head])
    create index(:tp_words, [:parent])
    create index(:tp_words, [:prepositional_object])
  end
end
