defmodule Lipu.Repo.Migrations.CreateTpLemma do
  use Ecto.Migration

  def change do
    create table(:tp_lemmas) do
      add :text, :string, null: false
      add :animacy, :boolean, null: true
      add :pos_id, references(:tp_parts_of_speech, on_delete: :nothing), null: false
      add :primary_id, references(:tp_lemmas, on_delete: :nothing)

      timestamps()
    end
    create index(:tp_lemmas, [:pos_id])
    create index(:tp_lemmas, [:primary_id])
    create unique_index(:tp_lemmas, [:text, :pos_id])

  end
end
