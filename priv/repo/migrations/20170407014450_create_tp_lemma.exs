defmodule Lipu.Repo.Migrations.CreateTpLemma do
  use Ecto.Migration

  def change do
    create table(:tp_lemmas) do
      add :text, :string, null: false
      add :animacy, :boolean, null: true
      add :pos, references(:tp_parts_of_speech, on_delete: :nothing), null: false
      add :primary, references(:tp_lemmas, on_delete: :nothing)

      timestamps()
    end
    create index(:tp_lemmas, [:pos])
    create index(:tp_lemmas, [:primary])
    create unique_index(:tp_lemmas, [:text, :pos])

  end
end
