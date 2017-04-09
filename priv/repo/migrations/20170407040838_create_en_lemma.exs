defmodule Lipu.Repo.Migrations.CreateEnLemma do
  use Ecto.Migration

  def change do
    create table(:en_lemmas) do
      add :text, :string, null: false
      add :pos_id, references(:en_parts_of_speech, on_delete: :nothing), null: false

      timestamps()
    end
    create index(:en_lemmas, [:pos_id])
    create unique_index(:en_lemmas, [:text, :pos_id])

  end
end
