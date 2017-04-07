defmodule Lipu.Repo.Migrations.CreateTpPartOfSpeech do
  use Ecto.Migration

  def change do
    create table(:tp_parts_of_speech) do
      add :name, :string, size: 4, null: false

      timestamps()
    end
    create unique_index(:tp_parts_of_speech, [:name])
  end
end
