defmodule Lipu.Repo.Migrations.CreateDocumentTranslation do
  use Ecto.Migration

  def change do
    create table(:document_translations) do
      add :phrases, {:map, :integer}, null: false
      add :english, :text, null: false
      add :tp_document_id, references(:tp_documents, on_delete: :delete_all), null: false

      timestamps()
    end
    create index(:document_translations, [:tp_document_id])

  end
end
